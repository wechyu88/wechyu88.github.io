/* 随笔 / Vlog 页面：列表（#）与单篇（#文章文件夹名）。平时只需写文章，不需要改这个文件。 */
(function () {
  'use strict';

  var S = window.SITE || {};
  var P = S.profile || {};
  var H = window.HOMEPAGE || { ready: function (cb) { cb(); }, posts: function () { return window.POSTS_PUBLIC || []; } };
  var main = document.getElementById('bl-main');
  var nav = document.getElementById('bl-nav');
  var CATS = ['全部', '生活', '科研'];
  var cat = '全部', tag = '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function dot(d) { return String(d || '').replace(/-/g, '.'); }
  function localTag(p) { return p.private ? '<span class="local-tag">仅本地</span>' : ''; }

  function loadTheme(cb) {
    var t = S.theme && S.theme !== 'warm' ? S.theme : '';
    if (!t) return cb();
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = 'assets/theme-' + t + '.css';
    l.onload = l.onerror = cb;
    document.querySelector('link[href$="style.css"]').insertAdjacentElement('afterend', l);
  }

  // 关联的论文 / 项目 / 竞赛（从 content.js 里找）
  function relatedCard(p) {
    var out = [];
    function find(list, id) { return (list || []).filter(function (x) { return x.id === id && !x.hide; })[0]; }
    var paper = p.paper && find(S.papers, p.paper);
    if (paper) out.push(['论文', paper.title, [paper.venue, String(paper.date || '').slice(0, 4)].filter(Boolean).join(' · '), './#papers']);
    var proj = p.project && find(S.projects, p.project);
    if (proj) out.push(['科研项目', proj.title, [proj.source, proj.years].filter(Boolean).join(' · '), './#projects']);
    var comp = p.competition && find(S.competitions, p.competition);
    if (comp) out.push(['竞赛', comp.name, comp.award, './#competitions']);
    if (!out.length) return '';
    return '<aside class="bl-related">' + out.map(function (r) {
      return '<a href="' + r[3] + '"><span class="bl-related-k">关联' + r[0] + '</span><strong>' + esc(r[1]) + '</strong>' +
        (r[2] ? '<span class="bl-related-m">' + esc(r[2]) + '</span>' : '') + '</a>';
    }).join('') + '</aside>';
  }

  function card(p, big) {
    return '<a class="bl-card' + (big ? ' is-big' : '') + '" href="#' + encodeURIComponent(p.slug) + '">' +
      (p.cover ? '<span class="bl-card-img"><img src="' + esc(p.cover) + '" alt="" loading="lazy"></span>' : '') +
      '<span class="bl-card-text">' +
      '<span class="bl-meta"><span class="bl-cat">' + esc(p.category) + '</span>' + dot(p.date) + localTag(p) + '</span>' +
      '<span class="bl-card-title">' + esc(p.title) + '</span>' +
      (p.summary ? '<span class="bl-card-sum">' + esc(p.summary) + '</span>' : '') +
      '</span></a>';
  }

  function renderNav(list) {
    var hasPrivate = list.some(function (p) { return p.private; });
    var cats = CATS.concat(hasPrivate ? ['仅本地'] : []);
    nav.innerHTML = cats.map(function (c) {
      var n = c === '全部' ? list.length : list.filter(function (p) { return c === '仅本地' ? p.private : p.category === c; }).length;
      return '<button data-cat="' + c + '" aria-pressed="' + (c === cat) + '">' + c + ' <span>' + n + '</span></button>';
    }).join('');
  }

  function renderList(all) {
    renderNav(all);
    var list = all.filter(function (p) {
      if (cat === '仅本地' && !p.private) return false;
      if (cat !== '全部' && cat !== '仅本地' && p.category !== cat) return false;
      return !tag || (p.tags || []).indexOf(tag) >= 0;
    });
    document.title = '随笔 · ' + (P.name || '');
    if (!all.length) {
      main.innerHTML = '<section class="bl-empty"><h1>还没有文章</h1><p>参照 <code>posts/_模板/index.md</code> 写第一篇，然后运行「更新文章」。</p></section>';
      return;
    }
    var html = '<header class="bl-head"><h1>随笔</h1><p>生活与科研的记录' + (tag ? '　·　标签「' + esc(tag) + '」<button class="bl-clear" data-tag="">清除</button>' : '') + '</p></header>';
    if (!list.length) html += '<p class="bl-none">这个分类下还没有文章。</p>';
    else {
      html += card(list[0], true);
      var rest = list.slice(1), year = '';
      if (rest.length) html += '<div class="bl-grid">';
      rest.forEach(function (p) {
        var y = String(p.date).slice(0, 4);
        if (y !== year && y !== String(list[0].date).slice(0, 4)) html += '<p class="bl-year">' + y + '</p>';
        year = y;
        html += card(p, false);
      });
      if (rest.length) html += '</div>';
    }
    main.innerHTML = html;
  }

  function renderPost(all, p) {
    var i = all.indexOf(p), newer = all[i - 1], older = all[i + 1];
    document.title = p.title + ' · ' + (P.name || '');
    nav.innerHTML = '<a class="bl-back" href="#">← 全部文章</a>';
    main.innerHTML = '<article class="bl-post">' +
      '<header class="bl-post-head"><p class="bl-meta"><span class="bl-cat">' + esc(p.category) + '</span>' + dot(p.date) + localTag(p) + '</p>' +
      '<h1>' + esc(p.title) + '</h1>' +
      ((p.tags || []).length ? '<p class="bl-tags">' + p.tags.map(function (t) { return '<button data-tag="' + esc(t) + '">#' + esc(t) + '</button>'; }).join('') + '</p>' : '') +
      '</header>' + relatedCard(p) +
      '<div class="bl-body">' + p.html + '</div>' +
      '<nav class="bl-pager">' +
      (newer ? '<a href="#' + encodeURIComponent(newer.slug) + '"><span>较新</span>' + esc(newer.title) + '</a>' : '<span></span>') +
      (older ? '<a class="is-older" href="#' + encodeURIComponent(older.slug) + '"><span>较早</span>' + esc(older.title) + '</a>' : '<span></span>') +
      '</nav></article>';
    window.scrollTo(0, 0);
  }

  function route() {
    var all = H.posts();
    var slug = decodeURIComponent(location.hash.slice(1));
    var p = slug && all.filter(function (x) { return x.slug === slug; })[0];
    if (p) renderPost(all, p); else renderList(all);
  }

  // 看大图
  function viewer() {
    var dlg = document.getElementById('viewer'), im = document.getElementById('viewer-img'), cap = document.getElementById('viewer-cap');
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-view]');
      if (t) { im.src = t.getAttribute('data-view'); cap.textContent = t.getAttribute('alt') || ''; if (dlg.showModal) dlg.showModal(); }
      else if (e.target === dlg) dlg.close();
    });
  }

  loadTheme(function () {
    H.ready(function () {
      document.getElementById('bl-home').textContent = P.name || '主页';
      viewer();
      nav.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]');
        if (b) { cat = b.getAttribute('data-cat'); tag = ''; route(); }
      });
      main.addEventListener('click', function (e) {
        var b = e.target.closest('[data-tag]');
        if (b) { tag = b.getAttribute('data-tag'); cat = '全部'; if (location.hash) location.hash = ''; else route(); }
      });
      window.addEventListener('hashchange', route);
      route();
    });
  });
})();
