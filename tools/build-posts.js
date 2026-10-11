#!/usr/bin/env node
/* =====================================================================
 *  文章 / Vlog 生成：把每篇文章的 index.md 转成网页能读取的 index.js。
 *
 *    posts/<文章文件夹>/index.md           公开文章（会出现在公开网站上）
 *    private/posts/<文章文件夹>/index.md   私密文章（只在自己电脑上能看到）
 *
 *  写完或改完文章后运行一次（或双击网站文件夹里的「更新文章」）：
 *    node tools/build-posts.js
 *
 *  只依赖 Node.js，Markdown 解析器已放在 tools/vendor/ 里。
 * ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const { marked } = require('./vendor/marked.umd.js');

const ROOT = path.resolve(__dirname, '..');
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- 文章开头的 --- 设置 --- ----------
function frontMatter(text) {
  const m = text.match(/^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^\s*([A-Za-z_]+)\s*[:：]\s*(.*?)\s*$/);
    if (!kv || line.trim().startsWith('#')) continue;
    let v = kv[2].replace(/^["'](.*)["']$/, '$1');
    if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(/[,，、]/).map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else if (v === 'true') v = true;
    else if (v === 'false') v = false;
    meta[kv[1].toLowerCase()] = v;
  }
  return { meta, body: text.slice(m[0].length) };
}

// ---------- 视频网址 → 播放器 ----------
function videoEmbed(url) {
  let m = url.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]+)/) || url.match(/^(BV[0-9A-Za-z]{10})$/);
  if (m) return '<div class="post-embed"><iframe src="https://player.bilibili.com/player.html?bvid=' + m[1] +
    '&autoplay=0&high_quality=1" allowfullscreen loading="lazy" title="视频"></iframe></div>';
  m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (m) return '<div class="post-embed"><iframe src="https://www.youtube-nocookie.com/embed/' + m[1] +
    '" allowfullscreen loading="lazy" title="视频"></iframe></div>';
  return null;
}

function render(md, baseUrl) {
  const resolve = href => {
    if (!href || /^(https?:|data:|mailto:|#|\/)/i.test(href)) return href;
    return baseUrl + href.replace(/^\.\//, '');
  };
  const renderer = new marked.Renderer();
  renderer.image = (href, title, text) => {
    const src = resolve(href);
    if (VIDEO.test(href || '')) {
      return '<figure class="post-video"><video src="' + esc(src) + '" controls preload="metadata" playsinline></video>' +
        (text ? '<figcaption>' + esc(text) + '</figcaption>' : '') + '</figure>';
    }
    return '<img src="' + esc(src) + '" alt="' + esc(text || '') + '" loading="lazy" data-view="' + esc(src) + '"' +
      (title ? ' title="' + esc(title) + '"' : '') + '>';
  };
  const baseLink = renderer.link.bind(renderer);
  renderer.link = (href, title, text) => baseLink(resolve(href), title, text).replace('<a ', '<a target="_blank" rel="noopener" ');
  const baseParagraph = renderer.paragraph.bind(renderer);
  renderer.paragraph = text => {
    const t = text.trim();
    const plain = t.replace(/<a [^>]*>(.*?)<\/a>/, '$1');
    const embed = /^https?:\/\/\S+$/.test(plain) || /^BV[0-9A-Za-z]{10}$/.test(plain) ? videoEmbed(plain) : null;
    if (embed) return embed;
    const imgs = (t.match(/<img /g) || []).length;
    if (imgs > 1 && !t.replace(/<img [^>]*>/g, '').replace(/<br>|\s/g, '')) return '<div class="post-grid">' + t.replace(/<br>/g, '') + '</div>\n';
    return baseParagraph(text);
  };
  return marked.parse(md, { renderer, gfm: true, breaks: true });
}

function plainSummary(md) {
  const para = md.split(/\n\s*\n/).map(p => p.trim()).find(p => p && !/^(#|!\[|<|https?:|BV|>|```|[-*] )/.test(p));
  if (!para) return '';
  const t = para.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`~]/g, '').replace(/\s+/g, ' ').trim();
  return t.length > 110 ? t.slice(0, 110) + '…' : t;
}

function build(dir, urlPrefix, isPrivate) {
  const posts = [];
  const problems = [];
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return { posts, problems, missing: true }; }
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith('_') || ent.name.startsWith('.')) continue;
    const file = path.join(dir, ent.name, 'index.md');
    if (!fs.existsSync(file)) { problems.push(ent.name + '：缺少 index.md'); continue; }
    const { meta, body } = frontMatter(fs.readFileSync(file, 'utf8'));
    if (meta.hide === true) continue;
    const base = urlPrefix + encodeURI(ent.name) + '/';
    const dateGuess = (ent.name.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || '';
    const titleFromBody = (body.match(/^#\s+(.+)$/m) || [])[1];
    const post = {
      slug: ent.name,
      title: meta.title || titleFromBody || ent.name,
      date: String(meta.date || dateGuess),
      category: meta.category || '生活',
      tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
      cover: meta.cover ? base + meta.cover.replace(/^\.\//, '') : '',
      summary: meta.summary || plainSummary(body),
      paper: meta.paper || '', project: meta.project || '', competition: meta.competition || '',
      private: isPrivate,
      html: render(body.replace(/^#\s+.+\r?\n/m, ''), base)   // 标题单独显示，正文里的一级标题去掉
    };
    if (!post.date) problems.push(ent.name + '：没有日期（写在设置里 date: 2026-10-11，或文件夹名用日期开头）');
    if (!post.cover) {
      const firstImg = body.match(/!\[[^\]]*\]\(([^)\s]+\.(?:jpe?g|png|webp|gif))\)/i);
      if (firstImg) post.cover = /^https?:/.test(firstImg[1]) ? firstImg[1] : base + firstImg[1].replace(/^\.\//, '');
    }
    // 提醒：大视频不适合放进仓库
    for (const f of fs.readdirSync(path.join(dir, ent.name))) {
      const size = fs.statSync(path.join(dir, ent.name, f)).size;
      if (size > 50 * 1024 * 1024) problems.push(ent.name + '/' + f + '：' + Math.round(size / 1048576) + ' MB，超过 50 MB，建议上传到 B 站后贴链接');
    }
    posts.push(post);
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return { posts, problems };
}

function write(file, varName, posts) {
  const js = '/* 自动生成，请勿手动修改：node tools/build-posts.js */\nwindow.' + varName + ' = ' + JSON.stringify(posts) + ';\n';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, js);
}

const pub = build(path.join(ROOT, 'posts'), 'posts/', false);
write(path.join(ROOT, 'posts', 'index.js'), 'POSTS_PUBLIC', pub.posts);
let msg = '公开文章 ' + pub.posts.length + ' 篇';
let problems = pub.problems;
if (fs.existsSync(path.join(ROOT, 'private'))) {
  const pri = build(path.join(ROOT, 'private', 'posts'), 'private/posts/', true);
  write(path.join(ROOT, 'private', 'posts', 'index.js'), 'POSTS_PRIVATE', pri.posts);
  msg += '，私密文章 ' + pri.posts.length + ' 篇';
  problems = problems.concat(pri.problems);
}
console.log('文章已更新：' + msg + '。');
problems.forEach(p => console.log('  注意：' + p));
