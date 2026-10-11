/* 工作日志页面：读取 private/worklog/data.js（只在本机），按日历和日期浏览、搜索。 */
(function () {
  'use strict';

  var H = window.HOMEPAGE || {};
  var S = window.SITE || {};
  var main = document.getElementById('wl-main');
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function weekday(s) { return '周' + WEEK[parse(s).getDay()]; }
  function base(f) { return String(f).split(/[\\/]/).pop(); }

  // 与主页相同的主题
  function loadTheme(cb) {
    var t = S.theme && S.theme !== 'warm' ? S.theme : '';
    if (!t) return cb();
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = 'assets/theme-' + t + '.css';
    l.onload = l.onerror = cb;
    document.querySelector('link[href$="style.css"]').insertAdjacentElement('afterend', l);
  }

  function loadData(cb) {
    var s = document.createElement('script');
    s.src = 'private/worklog/data.js?' + Date.now();
    s.onload = function () { cb(window.WORKLOG || null); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  // ---------- 状态 ----------
  var W, byDate = {}, sel = null, month = null, query = '';
  var view = 'overview', projectFilter = '', range = 30, openProject = '';

  function pname(s) { return (W.names && W.names[s.project]) || s.project; }
  function sessionsOf(day) {
    return projectFilter ? day.sessions.filter(function (s) { return pname(s) === projectFilter; }) : day.sessions;
  }

  function dayWeight(day) {
    return day.sessions.reduce(function (n, s) { return n + s.prompts.length; }, 0);
  }
  function level(n) { return n === 0 ? 0 : n <= 3 ? 1 : n <= 8 ? 2 : n <= 20 ? 3 : 4; }
  function projects(day) {
    var seen = {};
    sessionsOf(day).forEach(function (s) { seen[pname(s)] = 1; });
    return Object.keys(seen);
  }

  // ---------- 日历 ----------
  function calendar() {
    var y = month.getFullYear(), m = month.getMonth();
    var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
    var cells = '';
    for (var i = 0; i < first.getDay(); i++) cells += '<span class="wl-cell is-empty"></span>';
    for (var d = 1; d <= days; d++) {
      var key = y + '-' + pad(m + 1) + '-' + pad(d);
      var day = byDate[key];
      var lv = day ? level(dayWeight(day)) : 0;
      cells += day
        ? '<button class="wl-cell lv' + lv + (key === sel ? ' is-sel' : '') + '" data-day="' + key + '" title="' + key + ' · ' + day.sessions.length + ' 段对话">' + d + '</button>'
        : '<span class="wl-cell">' + d + '</span>';
    }
    return '<section class="wl-cal" aria-label="日历">' +
      '<div class="wl-cal-head"><button class="wl-nav" data-month="-1" aria-label="上个月">‹</button>' +
      '<strong>' + y + ' 年 ' + (m + 1) + ' 月</strong>' +
      '<button class="wl-nav" data-month="1" aria-label="下个月">›</button></div>' +
      '<div class="wl-week">' + WEEK.map(function (w) { return '<span>' + w + '</span>'; }).join('') + '</div>' +
      '<div class="wl-grid">' + cells + '</div>' +
      '<p class="wl-legend">少 <i class="lv1"></i><i class="lv2"></i><i class="lv3"></i><i class="lv4"></i> 多</p>' +
      '</section>';
  }

  // ---------- 日期列表（或搜索结果） ----------
  function dayList() {
    var list, title;
    if (query) {
      var q = query.toLowerCase();
      list = W.days.filter(function (day) {
        return JSON.stringify(day).toLowerCase().indexOf(q) >= 0;
      });
      title = '搜索「' + esc(query) + '」：' + list.length + ' 天';
    } else {
      var pre = month.getFullYear() + '-' + pad(month.getMonth() + 1);
      list = W.days.filter(function (day) { return day.date.indexOf(pre) === 0; });
      title = '本月 ' + list.length + ' 天有记录';
    }
    if (projectFilter) {
      list = list.filter(function (day) { return sessionsOf(day).length; });
      title = '只看「' + esc(projectFilter) + '」：' + list.length + ' 天 <button class="wl-chip" data-clear-project>× 取消</button>';
    }
    return '<section class="wl-days"><p class="wl-days-title">' + title + '</p><ul>' +
      list.map(function (day) {
        return '<li><button class="wl-day' + (day.date === sel ? ' is-sel' : '') + '" data-day="' + day.date + '">' +
          '<span class="wl-day-date">' + day.date.slice(5).replace('-', '.') + ' <em>' + weekday(day.date) + '</em></span>' +
          '<span class="wl-day-meta">' + sessionsOf(day).length + ' 段 · ' + esc(projects(day).join('、')) + '</span></button></li>';
      }).join('') + '</ul></section>';
  }

  // ---------- 某一天的详情 ----------
  function mark(text) {
    var t = esc(text);
    if (!query) return t;
    var q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return t.replace(new RegExp(q, 'gi'), function (m) { return '<mark>' + m + '</mark>'; });
  }
  function detail() {
    var day = byDate[sel];
    if (!day) return '<section class="wl-detail"><p class="wl-empty">在左边的日历或列表里选一天。</p></section>';
    var total = dayWeight(day);
    return '<section class="wl-detail">' +
      '<header class="wl-detail-head"><h2>' + day.date.replace(/-/g, '.') + ' <span>' + weekday(day.date) + '</span></h2>' +
      '<p>' + day.sessions.length + ' 段对话 · ' + total + ' 次请求 · ' + esc(projects(day).join('、')) + '</p></header>' +
      (day.summary ? '<div class="wl-summary"><p class="wl-label">当日小结</p>' + esc(day.summary).replace(/\n/g, '<br>') + '</div>' : '') +
      sessionsOf(day).map(function (s) {
        return '<article class="wl-session">' +
          '<header><span class="wl-tool wl-tool-' + (s.tool === 'Codex' ? 'codex' : 'claude') + '">' + esc(s.tool) + '</span>' +
          '<strong>' + esc(pname(s)) + '</strong><span class="wl-time">' + esc(s.start) + '–' + esc(s.end) + '</span>' +
          (s.machine ? '<span class="wl-machine">' + esc(s.machine) + '</span>' : '') + '</header>' +
          '<p class="wl-label">我的请求</p><ol class="wl-prompts">' + s.prompts.map(function (p) {
            return '<li><time>' + esc(p.t) + '</time><span>' + mark(p.text).replace(/\n/g, '<br>') + '</span></li>';
          }).join('') + '</ol>' +
          (s.replies.length ? '<details class="wl-replies"><summary>助手回复（' + s.replies.length + '）</summary><ol>' +
            s.replies.map(function (r) {
              return '<li><time>' + esc(r.t) + '</time><span>' + mark(r.text).replace(/\n/g, '<br>') + '</span></li>';
            }).join('') + '</ol></details>' : '') +
          (s.files.length ? '<p class="wl-label">改动的文件</p><p class="wl-files">' + s.files.map(function (f) {
            return '<code title="' + esc(f) + '">' + esc(base(f)) + '</code>';
          }).join('') + '</p>' : '') +
          (s.cwd ? '<p class="wl-cwd">' + esc(s.cwd) + '</p>' : '') +
          '</article>';
      }).join('') + '</section>';
  }

  function render() {
    document.querySelectorAll('.wl-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.view === view)); });
    document.querySelector('.wl-search').hidden = view !== 'days';
    main.classList.toggle('is-overview', view === 'overview');
    if (view === 'overview') { main.innerHTML = overview(); return; }
    main.innerHTML = '<div class="wl-side">' + calendar() + dayList() + '</div>' + detail();
  }

  // ================= 总览 =================
  function dateAdd(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
  function short(s) { var p = s.split('-'); return (+p[1]) + '.' + p[2]; }

  function collect() {
    var today = ymd(new Date());
    var from = range ? dateAdd(today, -(range - 1)) : (W.days.length ? W.days[W.days.length - 1].date : today);
    var dates = [];
    for (var d = from; d <= today; d = dateAdd(d, 1)) dates.push(d);
    var P = {}, hours = new Array(24).fill(0), total = 0, sessions = 0, active = 0;
    W.days.forEach(function (day) {
      day.sessions.forEach(function (s) {
        var n = pname(s), p = P[n] || (P[n] = { name: n, dir: s.project, daily: {}, total: 0, days: {}, tools: {}, files: {}, last: '', recent: [], all: 0 });
        p.all += s.prompts.length;
        if (day.date > p.last) p.last = day.date;
        if (day.date < from) return;
        p.total += s.prompts.length;
        p.daily[day.date] = (p.daily[day.date] || 0) + s.prompts.length;
        p.days[day.date] = 1;
        p.tools[s.tool] = 1;
        s.files.forEach(function (f) { var b = base(f); p.files[b] = (p.files[b] || 0) + 1; });
        s.prompts.forEach(function (q) { p.recent.push({ d: day.date, t: q.t, text: q.text }); hours[+q.t.slice(0, 2)]++; });
      });
      if (day.date >= from) { active++; sessions += day.sessions.length; total += day.sessions.reduce(function (n, s) { return n + s.prompts.length; }, 0); }
    });
    var list = Object.keys(P).map(function (k) { return P[k]; })
      .filter(function (p) { return p.total > 0 || p.last >= dateAdd(today, -120); })
      .sort(function (a, b) { return b.total - a.total || b.last.localeCompare(a.last); });
    return { today: today, from: from, dates: dates, projects: list, hours: hours, total: total, sessions: sessions, active: active };
  }

  function spark(p, dates) {
    var vals = dates.map(function (d) { return p.daily[d] || 0; });
    var w = 240, h = 40, n = vals.length, gap = n > 60 ? 0.5 : n > 20 ? 1.5 : 3;
    var bw = Math.max(0.5, (w - gap * (n - 1)) / n), max = Math.max.apply(null, vals.concat([1]));
    var out = '<svg class="ov-spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="' + esc(p.name) + ' 每日请求次数">' +
      '<line x1="0" x2="' + w + '" y1="' + (h - .5) + '" y2="' + (h - .5) + '" stroke="var(--line)"/>';
    vals.forEach(function (v, i) {
      var bh = v ? Math.max(2, v / max * (h - 4)) : 0, x = i * (bw + gap);
      out += '<rect x="' + x.toFixed(2) + '" y="' + (h - bh).toFixed(2) + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '" rx="1" fill="var(--accent)"/>' +
        '<rect x="' + x.toFixed(2) + '" y="0" width="' + (bw + gap).toFixed(2) + '" height="' + h + '" fill="transparent" data-tip="' + short(dates[i]) + ' · ' + v + ' 次请求"/>';
    });
    return out + '</svg>';
  }

  function points(p) {
    var ai = W.insights && W.insights.projects && W.insights.projects[p.name];
    if (ai && ai.length) return { ai: true, list: ai };
    var seen = {}, out = [];
    p.recent.slice().reverse().forEach(function (r) {
      var t = r.text.replace(/\s+/g, ' ');
      if (out.length < 3 && !seen[t]) { seen[t] = 1; out.push(t.length > 60 ? t.slice(0, 60) + '…' : t); }
    });
    return { ai: false, list: out };
  }

  function projectTile(p, rank, c) {
    var idle = Math.round((parse(c.today) - parse(p.last)) / 864e5);
    var on = idle <= 7, big = rank <= 1, pts = points(p);
    var files = Object.keys(p.files).sort(function (a, b) { return p.files[b] - p.files[a]; }).slice(0, 5);
    return '<button class="ov-tile ov-proj' + (rank === 0 ? ' w2 h2' : rank === 1 ? ' w2' : '') + (p.total ? '' : ' is-idle') + (openProject === p.name ? ' is-open' : '') + '" data-project="' + esc(p.name) + '">' +
      '<span class="ov-top"><span class="ov-name">' + esc(p.name) + '</span><span class="ov-state' + (on ? ' on' : '') + '"><i></i>' + (on ? '进行中' : idle + ' 天未动') + '</span></span>' +
      '<span class="ov-meta"><code>' + esc(p.dir) + '</code> · 最近 ' + short(p.last) + '</span>' +
      (pts.list.length ? '<span class="ov-k">' + (pts.ai ? '进展' : '最近的请求') + '</span><ul class="ov-points">' + pts.list.slice(0, big ? 3 : 1).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      (rank === 0 ? '<span class="ov-tools">' + Object.keys(p.tools).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</span>' +
        (files.length ? '<span class="ov-files">' + files.map(function (f) { return '<code>' + esc(f) + '</code>'; }).join('') + '</span>' : '') : '') +
      '<span class="ov-foot"><span class="ov-num"><b>' + p.total + '</b>次 · ' + Object.keys(p.days).length + ' 天</span>' + spark(p, c.dates) + '</span></button>';
  }

  function heatTile() {
    var today = ymd(new Date()), start = dateAdd(today, -83);
    start = dateAdd(start, -parse(start).getDay());
    var cells = '';
    for (var d = start; d <= today; d = dateAdd(d, 1)) {
      var day = byDate[d], v = day ? dayWeight(day) : 0, l = level(v);
      cells += '<span class="lv' + l + '" data-tip="' + short(d) + ' · ' + v + ' 次请求"></span>';
    }
    return '<section class="ov-tile w2"><p class="ov-k">节奏 · 最近 12 周</p><div class="ov-heat" role="img" aria-label="最近 12 周每天的请求次数">' + cells + '</div>' +
      '<p class="wl-legend">少 <i class="lv0"></i><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i><i class="lv4"></i> 多</p></section>';
  }

  function hoursTile(c) {
    var w = 240, h = 80, gap = 2, bw = (w - gap * 23) / 24, max = Math.max.apply(null, c.hours.concat([1]));
    var svg = '<svg class="ov-hours" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="一天中各时段的请求次数">' +
      '<line x1="0" x2="' + w + '" y1="' + (h - .5) + '" y2="' + (h - .5) + '" stroke="var(--line)"/>';
    c.hours.forEach(function (v, i) {
      var bh = v ? Math.max(2, v / max * (h - 4)) : 0, x = i * (bw + gap);
      svg += '<rect x="' + x.toFixed(2) + '" y="' + (h - bh).toFixed(2) + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '" rx="1" fill="var(--accent)"/>' +
        '<rect x="' + x.toFixed(2) + '" y="0" width="' + (bw + gap).toFixed(2) + '" height="' + h + '" fill="transparent" data-tip="' + pad(i) + ':00–' + pad(i + 1) + ':00 · ' + v + ' 次"/>';
    });
    var top = c.hours.map(function (v, i) { return [v, i]; }).sort(function (a, b) { return b[0] - a[0]; }).filter(function (x) { return x[0]; }).slice(0, 2)
      .map(function (x) { return x[1] + ' 点'; });
    return '<section class="ov-tile w2"><p class="ov-k">工作时段</p>' + svg + '</svg>' +
      '<div class="ov-axis"><span>0 时</span><span>12 时</span><span>24 时</span></div>' +
      (top.length ? '<p class="ov-note">最常在 ' + top.join('、') + '前后工作。</p>' : '') + '</section>';
  }

  function issuesTile() {
    var list = (W.insights && W.insights.issues) || [];
    var body = list.length ? '<ul class="ov-issues">' + list.slice(0, 8).map(function (x) {
      var done = x.status === 'done';
      return '<li><span class="ov-mark ' + (done ? 'done' : 'open') + '">' + (done ? '✓ 已解决' : '○ 未解决') + '</span><span>' + esc(x.text) + '</span>' +
        '<small>' + esc([x.project, x.date].filter(Boolean).join(' · ')) + '</small></li>';
    }).join('') + '</ul>'
      : '<p class="ov-note">运行 <code>node tools/worklog-sync.js --summarize</code> 后，这里会列出对话里提到的报错、卡住的问题和待办，并标出是否已解决。</p>';
    return '<section class="ov-tile h2"><p class="ov-k">问题追踪' + (list.length ? ' · AI 从对话里摘出' : '') + '</p>' + body + '</section>';
  }

  function drill(c) {
    var p = c.projects.filter(function (x) { return x.name === openProject; })[0];
    if (!p) return '';
    var rows = [];
    W.days.forEach(function (day) {
      var ss = day.sessions.filter(function (s) { return pname(s) === p.name; });
      if (!ss.length || rows.length >= 5) return;
      var n = ss.reduce(function (k, s) { return k + s.prompts.length; }, 0);
      rows.push('<li><time>' + short(day.date) + ' · ' + n + ' 次</time><span>' + esc(ss[0].prompts[0].text.replace(/\s+/g, ' ').slice(0, 90)) + '</span></li>');
    });
    return '<section class="ov-drill"><h2>' + esc(p.name) + '</h2><p class="ov-k">最近 ' + rows.length + ' 个有记录的日子</p><ol>' + rows.join('') + '</ol>' +
      '<button class="ov-go" data-filter-project="' + esc(p.name) + '">在「按日浏览」中只看这个项目 →</button></section>';
  }

  function overview() {
    var c = collect();
    var label = range === 7 ? '近 7 天' : range === 30 ? '近 30 天' : range === 120 ? '近 4 个月' : '全部记录';
    var html = '<section class="ov-head"><div><h2>' + label + '在做什么<small>' + short(c.from) + ' – ' + short(c.today) +
      (W.insights && W.insights.generated ? '　·　要点整理于 ' + short(ymd(new Date(W.insights.generated))) : '') + '</small></h2>' +
      '<div class="ov-figs">' + [[c.active, '天有记录'], [c.sessions, '段对话'], [c.total, '次请求'], [c.projects.filter(function (p) { return p.total; }).length, '个项目']].map(function (f) {
        return '<span><b>' + f[0] + '</b>' + f[1] + '</span>';
      }).join('') + '</div></div>' +
      '<div class="ov-range" role="group" aria-label="时间范围">' + [[7, '近 7 天'], [30, '近 30 天'], [120, '近 4 个月'], [0, '全部']].map(function (r) {
        return '<button data-range="' + r[0] + '" aria-pressed="' + (r[0] === range) + '">' + r[1] + '</button>';
      }).join('') + '</div></section>';
    var ps = c.projects.slice(0, 9);
    html += '<section class="ov-mosaic">';
    if (ps[0]) html += projectTile(ps[0], 0, c);
    html += issuesTile();
    if (ps[1]) html += projectTile(ps[1], 1, c);
    html += heatTile();
    ps.slice(2).forEach(function (p) { html += projectTile(p, 2, c); });
    html += hoursTile(c) + '</section>' + drill(c);
    return html;
  }

  function select(day, scroll) {
    view = 'days';
    sel = day;
    month = parse(day); month.setDate(1);
    history.replaceState(null, '', '#' + day);
    render();
    if (scroll && window.innerWidth < 900) document.querySelector('.wl-detail').scrollIntoView({ behavior: 'smooth' });
  }

  function message(html) { main.innerHTML = '<section class="wl-msg">' + html + '</section>'; }

  // ---------- 启动 ----------
  loadTheme(function () {
    if (!H.local) {
      document.querySelector('.wl-search').hidden = true;
      return message('<p>此页面仅供本人在本地使用。</p><p><a href="index.html">返回主页</a></p>');
    }
    H.ready(function () {
      loadData(function (data) {
        if (!data || !data.days || !data.days.length) {
          return message('<h2>还没有工作日志</h2><p>在网站文件夹里打开终端，运行：</p>' +
            '<pre>node tools/worklog-sync.js</pre><p>想让它以后自动更新，再运行一次：</p><pre>node tools/worklog-sync.js --install</pre>');
        }
        W = data;
        W.days.forEach(function (d) { byDate[d.date] = d; });
        if (W.updated) {
          var u = new Date(W.updated);
          document.getElementById('wl-updated').textContent = '最后同步 ' + ymd(u) + ' ' + pad(u.getHours()) + ':' + pad(u.getMinutes());
        }
        var want = location.hash.slice(1);
        document.querySelector('.wl-tabs').hidden = false;
        if (byDate[want]) select(want, false);
        else { sel = W.days[0].date; month = parse(sel); month.setDate(1); render(); }

        document.querySelector('.wl-tabs').addEventListener('click', function (e) {
          var b = e.target.closest('[data-view]'); if (!b) return;
          view = b.dataset.view;
          history.replaceState(null, '', view === 'days' ? '#' + sel : '#');
          render();
        });
        var tip = document.createElement('div');
        tip.className = 'ov-tip'; tip.hidden = true; document.body.appendChild(tip);
        document.addEventListener('pointermove', function (e) {
          var t = e.target.closest && e.target.closest('[data-tip]');
          if (!t) { tip.hidden = true; return; }
          tip.textContent = t.getAttribute('data-tip');
          tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.hidden = false;
        });

        main.addEventListener('click', function (e) {
          var r = e.target.closest('[data-range]');
          if (r) { range = +r.getAttribute('data-range'); return render(); }
          var pj = e.target.closest('[data-project]');
          if (pj) {
            openProject = openProject === pj.dataset.project ? '' : pj.dataset.project;
            render();
            var dr = document.querySelector('.ov-drill');
            if (dr) dr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
          }
          var fp = e.target.closest('[data-filter-project]');
          if (fp) {
            projectFilter = fp.dataset.filterProject;
            var first = W.days.filter(function (d) { return sessionsOf(d).length; })[0];
            return select(first ? first.date : sel, false);
          }
          if (e.target.closest('[data-clear-project]')) { projectFilter = ''; return render(); }
          var b = e.target.closest('[data-day]');
          if (b) return select(b.getAttribute('data-day'), true);
          var n = e.target.closest('[data-month]');
          if (n) { month.setMonth(month.getMonth() + (+n.getAttribute('data-month'))); render(); }
        });
        var timer;
        document.getElementById('wl-q').addEventListener('input', function (e) {
          clearTimeout(timer);
          timer = setTimeout(function () { query = e.target.value.trim(); render(); }, 150);
        });
      });
    });
  });
})();
