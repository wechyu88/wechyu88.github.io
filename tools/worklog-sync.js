#!/usr/bin/env node
/* =====================================================================
 *  工作日志同步：把本机 Claude Code 和 Codex 的对话整理成按天的工作日志，
 *  写进 private/worklog/（不会进入公开仓库），在本地打开 worklog.html 查看。
 *
 *  用法（在网站文件夹里）：
 *    node tools/worklog-sync.js              同步一次
 *    node tools/worklog-sync.js --install    设置为自动同步（Claude Code 每次回复后、Codex 每轮结束后）
 *    node tools/worklog-sync.js --uninstall  取消自动同步
 *    node tools/worklog-sync.js --summarize  另外用 Claude 为已结束的日子各写一段中文小结（会消耗少量额度）
 *
 *  只依赖 Node.js（装 Claude Code / Codex 时已经装好），不需要额外安装任何东西。
 * ===================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// 被自己调用的 claude -p 触发时直接退出，避免循环
if (process.env.WORKLOG_SYNC_RUNNING) process.exit(0);

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'private', 'worklog');
const HOME = os.homedir();
const MACHINE = os.hostname().replace(/[^\w.-]+/g, '_') || 'this-computer';
const SUMMARY_MARK = '[worklog-summary]';

const LIMIT = { prompt: 600, reply: 900, prompts: 40, replies: 40, files: 60 };

// ---------- 工具 ----------
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}
function writeFileSafe(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}
function cut(s, n) {
  s = String(s || '').replace(/\r/g, '').trim();
  return s.length > n ? s.slice(0, n) + '…' : s;
}
function pad(n) { return String(n).padStart(2, '0'); }
function localDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function localTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function walk(dir, test, out) {
  out = out || [];
  let list;
  try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const ent of list) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, test, out);
    else if (test(p)) out.push(p);
  }
  return out;
}
function readLines(file) {
  const rows = [];
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return rows; }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); } catch (e) { /* 跳过损坏的行 */ }
  }
  return rows;
}
function isNoise(text) {
  const t = String(text || '').trim();
  return !t || t.startsWith('<') || t.startsWith('Caveat:') || t.includes(SUMMARY_MARK) ||
    /^\[Request interrupted/.test(t);
}

// ---------- 一个会话 → 按天拆分的记录 ----------
function newSession(tool, id, cwd) {
  return { tool, id, cwd: cwd || '', events: [] };
}
function addEvent(s, kind, ts, text) {
  const d = new Date(ts);
  if (isNaN(d)) return;
  s.events.push({ kind, d, text });
}
function splitByDay(s) {
  const byDay = {};
  for (const e of s.events) {
    const day = localDate(e.d);
    (byDay[day] = byDay[day] || []).push(e);
  }
  return Object.keys(byDay).map(day => {
    const ev = byDay[day].sort((a, b) => a.d - b.d);
    const prompts = ev.filter(e => e.kind === 'prompt');
    const replies = ev.filter(e => e.kind === 'reply');
    const files = Array.from(new Set(ev.filter(e => e.kind === 'file').map(e => e.text)));
    if (!prompts.length) return null;
    return {
      date: day,
      tool: s.tool,
      id: s.id,
      project: path.basename(s.cwd || '') || '(未知目录)',
      cwd: s.cwd,
      start: localTime(ev[0].d),
      end: localTime(ev[ev.length - 1].d),
      prompts: prompts.slice(0, LIMIT.prompts).map(e => ({ t: localTime(e.d), text: cut(e.text, LIMIT.prompt) })),
      replies: replies.slice(-LIMIT.replies).map(e => ({ t: localTime(e.d), text: cut(e.text, LIMIT.reply) })),
      files: files.slice(0, LIMIT.files)
    };
  }).filter(Boolean);
}

// ---------- Claude Code：~/.claude/projects/<目录>/<会话>.jsonl ----------
function parseClaude(file) {
  const rows = readLines(file);
  const s = newSession('Claude Code', path.basename(file, '.jsonl'), '');
  for (const o of rows) {
    if (o.isSidechain) continue;                       // 子任务的对话不算
    if (o.cwd && !s.cwd) s.cwd = o.cwd;
    const m = o.message;
    if (!m || !o.timestamp) continue;
    if (o.type === 'user') {
      if (o.isMeta) continue;
      if (o.origin && o.origin.kind && o.origin.kind !== 'human') continue;
      const c = m.content;
      if (typeof c === 'string') { if (!isNoise(c)) addEvent(s, 'prompt', o.timestamp, c); continue; }
      if (Array.isArray(c)) {
        if (c.some(b => b && b.type === 'tool_result')) continue;
        if (!o.origin) continue;                         // 旧版本里列表形式的多为系统注入
        const t = c.filter(b => b && b.type === 'text').map(b => b.text).join('\n');
        if (!isNoise(t)) addEvent(s, 'prompt', o.timestamp, t);
      }
    } else if (o.type === 'assistant' && Array.isArray(m.content)) {
      for (const b of m.content) {
        if (!b) continue;
        if (b.type === 'text' && b.text && b.text.trim()) addEvent(s, 'reply', o.timestamp, b.text);
        if (b.type === 'tool_use' && b.input) {
          const f = b.input.file_path || b.input.notebook_path || b.input.path;
          if (f && /^(Edit|Write|MultiEdit|NotebookEdit)$/.test(b.name)) addEvent(s, 'file', o.timestamp, f);
        }
      }
    }
  }
  return splitByDay(s);
}

// ---------- Codex：~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl ----------
function codexText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.map(c => (c && (c.text || c.input_text || c.output_text)) || '').join('\n');
}
function parseCodex(file) {
  const rows = readLines(file);
  const s = newSession('Codex', path.basename(file, '.jsonl'), '');
  let fallbackTs = null;
  let sawUserEvent = false;
  rows.forEach(o => { const p = o.payload || o; if (o.type === 'event_msg' && p.type === 'user_message') sawUserEvent = true; });
  for (const o of rows) {
    const p = o.payload || o;
    const ts = o.timestamp || p.timestamp || fallbackTs;
    if (ts) fallbackTs = ts;
    if (o.type === 'session_meta' || (p.cwd && !s.cwd)) { if (p.cwd) s.cwd = p.cwd; }
    if (o.type === 'turn_context' && p.cwd && !s.cwd) s.cwd = p.cwd;
    if (!ts) continue;
    // 新版：event_msg 里有干净的用户输入和助手回复
    if (o.type === 'event_msg') {
      if (p.type === 'user_message' && !isNoise(p.message)) addEvent(s, 'prompt', ts, p.message);
      if (p.type === 'agent_message' && p.message) addEvent(s, 'reply', ts, p.message);
      continue;
    }
    // 旧版或没有 event_msg 时：从 message 条目里取
    if (p.type === 'message') {
      const t = codexText(p.content);
      if (p.role === 'user' && !sawUserEvent && !isNoise(t)) addEvent(s, 'prompt', ts, t);
      if (p.role === 'assistant' && !sawUserEvent && t.trim()) addEvent(s, 'reply', ts, t);
    }
    // 改过的文件：apply_patch 里的 "*** Update File: 路径"
    if (p.type === 'function_call' || p.type === 'custom_tool_call' || p.type === 'local_shell_call') {
      const args = String(p.arguments || p.input || JSON.stringify(p.action || ''));
      const re = /\*\*\* (?:Update|Add|Delete) File: ([^\n"\\]+)/g;
      let m;
      while ((m = re.exec(args))) addEvent(s, 'file', ts, m[1].trim());
    }
  }
  return splitByDay(s);
}

// ---------- 主流程 ----------
function collect() {
  const cachePath = path.join(OUT_DIR, '.cache-' + MACHINE + '.json');
  const cache = readJSON(cachePath, {});
  const nextCache = {};
  const sources = [
    { dir: path.join(HOME, '.claude', 'projects'), parse: parseClaude, test: p => p.endsWith('.jsonl') },
    { dir: path.join(process.env.CODEX_HOME || path.join(HOME, '.codex'), 'sessions'), parse: parseCodex, test: p => p.endsWith('.jsonl') }
  ];
  const sessions = [];
  for (const src of sources) {
    for (const file of walk(src.dir, src.test)) {
      let st;
      try { st = fs.statSync(file); } catch (e) { continue; }
      const key = file;
      const stamp = st.size + ':' + st.mtimeMs;
      let parsed = cache[key] && cache[key].stamp === stamp ? cache[key].data : null;
      if (!parsed) parsed = src.parse(file);
      nextCache[key] = { stamp, data: parsed };
      sessions.push.apply(sessions, parsed);
    }
  }
  writeFileSafe(cachePath, JSON.stringify(nextCache));
  return sessions;
}

function loadConfig() {
  return readJSON(path.join(OUT_DIR, 'config.json'), { exclude: [] });
}

function buildMachineFile(sessions) {
  const cfg = loadConfig();
  const excl = (cfg.exclude || []).map(x => String(x).toLowerCase());
  const kept = sessions.filter(s => !excl.some(x => (s.cwd || '').toLowerCase().includes(x) || s.project.toLowerCase() === x));
  // 同一会话可能出现在多个目录（例如续接对话），按 工具+会话+日期 去重，保留内容最多的一份
  const best = {};
  for (const s of kept) {
    const k = s.tool + '|' + s.id + '|' + s.date;
    if (!best[k] || s.prompts.length + s.replies.length > best[k].prompts.length + best[k].replies.length) best[k] = s;
  }
  const keep = Object.keys(best).map(k => best[k]);
  keep.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  return { machine: MACHINE, updated: new Date().toISOString(), sessions: keep };
}

function rebuildData() {
  // 合并所有电脑的记录（每台电脑一个 <电脑名>.json，方便多台电脑通过私有仓库同步）
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.json') && !f.startsWith('.') && f !== 'config.json' && f !== 'summaries.json');
  const days = {};
  let updated = '';
  for (const f of files) {
    const m = readJSON(path.join(OUT_DIR, f), null);
    if (!m || !Array.isArray(m.sessions)) continue;
    if (m.updated > updated) updated = m.updated;
    for (const s of m.sessions) {
      s.machine = m.machine;
      (days[s.date] = days[s.date] || []).push(s);
    }
  }
  const summaries = readJSON(path.join(OUT_DIR, 'summaries.json'), {});
  const list = Object.keys(days).sort().reverse().map(date => ({
    date,
    summary: summaries[date] ? summaries[date].text : '',
    sessions: days[date].sort((a, b) => a.start.localeCompare(b.start))
  }));
  const js = '/* 自动生成，请勿手动修改：node tools/worklog-sync.js */\n' +
    'window.WORKLOG = ' + JSON.stringify({ updated, days: list }) + ';\n';
  writeFileSafe(path.join(OUT_DIR, 'data.js'), js);
  return list;
}

// ---------- 可选：用 Claude 写每日小结 ----------
function summarize(list) {
  const file = path.join(OUT_DIR, 'summaries.json');
  const summaries = readJSON(file, {});
  const today = localDate(new Date());
  const todo = list.filter(d => d.date < today && !summaries[d.date]).slice(0, 5);
  for (const day of todo) {
    const digest = day.sessions.map(s =>
      `【${s.tool} · ${s.project} · ${s.start}-${s.end}】\n` +
      s.prompts.map(p => '- ' + p.text.replace(/\n+/g, ' ').slice(0, 300)).join('\n') +
      (s.files.length ? '\n改动文件：' + s.files.map(f => path.basename(f)).join('、') : '')
    ).join('\n\n');
    const prompt = SUMMARY_MARK + ' 下面是我某一天与 AI 编程助手的工作记录。请用中文写一段工作日志小结（3-6 条要点，' +
      '每条一句，说明做了什么、结果如何；不要寒暄、不要标题）。\n\n日期：' + day.date + '\n\n' + digest.slice(0, 12000);
    const r = spawnSync('claude', ['-p', prompt], {
      encoding: 'utf8', timeout: 180000, shell: process.platform === 'win32',
      env: Object.assign({}, process.env, { WORKLOG_SYNC_RUNNING: '1' })
    });
    if (r.status === 0 && r.stdout && r.stdout.trim()) {
      summaries[day.date] = { text: r.stdout.trim(), at: new Date().toISOString() };
      writeFileSafe(file, JSON.stringify(summaries, null, 2));
      console.log('已生成小结：' + day.date);
    } else {
      console.log('小结生成失败（' + day.date + '），可稍后再试：' + cut(r.stderr || r.error || '', 200));
      break;
    }
  }
}

// ---------- 安装 / 卸载自动同步 ----------
function hookCommand() {
  return 'node ' + JSON.stringify(path.join(__dirname, 'worklog-sync.js'));
}
function backup(file) {
  if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak-worklog');
}
function writeIfChanged(file, text) {
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (old === text) return false;
  backup(file);
  writeFileSafe(file, text);
  return true;
}
function install(remove) {
  const cmd = hookCommand();
  // Claude Code：~/.claude/settings.json 里的 Stop hook
  const cs = path.join(HOME, '.claude', 'settings.json');
  const settings = readJSON(cs, {});
  settings.hooks = settings.hooks || {};
  const stop = (settings.hooks.Stop || []).filter(g => !(g.hooks || []).some(h => String(h.command || '').includes('worklog-sync.js')));
  if (!remove) stop.push({ hooks: [{ type: 'command', command: cmd, timeout: 60 }] });
  if (stop.length) settings.hooks.Stop = stop; else delete settings.hooks.Stop;
  writeIfChanged(cs, JSON.stringify(settings, null, 2) + '\n');
  console.log((remove ? '已移除' : '已设置') + ' Claude Code 自动同步：' + cs);

  // Codex：~/.codex/config.toml 顶部的 notify
  const cx = path.join(process.env.CODEX_HOME || path.join(HOME, '.codex'), 'config.toml');
  let toml = fs.existsSync(cx) ? fs.readFileSync(cx, 'utf8') : '';
  const ours = /^notify\s*=.*worklog-sync\.js.*\n?/m;
  if (remove) {
    if (ours.test(toml)) { backup(cx); writeFileSafe(cx, toml.replace(ours, '')); console.log('已移除 Codex 自动同步：' + cx); }
    return;
  }
  if (ours.test(toml)) { console.log('Codex 自动同步已存在：' + cx); return; }
  if (/^notify\s*=/m.test(toml)) {
    console.log('Codex 的 config.toml 里已经有别的 notify 设置，没有改动。可以改为定时运行：' + cmd);
    return;
  }
  const line = "notify = ['node', '" + path.join(__dirname, 'worklog-sync.js').replace(/'/g, '') + "']\n";
  backup(cx);
  writeFileSafe(cx, line + toml);   // notify 必须写在所有 [表] 之前
  console.log('已设置 Codex 自动同步：' + cx);
}

// ---------- 入口 ----------
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--install')) return install(false);
  if (args.includes('--uninstall')) return install(true);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(path.join(ROOT, 'private'))) {
    console.error('没有找到 private 文件夹：' + path.join(ROOT, 'private'));
    process.exit(0);
  }
  const sessions = collect();
  writeFileSafe(path.join(OUT_DIR, MACHINE + '.json'), JSON.stringify(buildMachineFile(sessions)));
  let list = rebuildData();
  if (args.includes('--summarize')) { summarize(list); list = rebuildData(); }
  if (process.stdout.isTTY) console.log('工作日志已更新：' + list.length + ' 天，' + sessions.length + ' 段对话。');
}

try { main(); } catch (e) {
  // 自动同步出错时不打断 Claude Code / Codex，只记一行日志
  try { fs.appendFileSync(path.join(OUT_DIR, 'error.log'), new Date().toISOString() + ' ' + (e && e.stack || e) + '\n'); } catch (_) {}
  if (process.stdout.isTTY) console.error(e);
  process.exit(0);
}
