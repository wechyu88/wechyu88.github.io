/* 本地详细版支持。
 *
 * 只有在自己电脑上打开（双击 index.html，或 localhost）时才会尝试读取
 * private/details.js，把作品名称、学生名单、指导教师排名、材料、学生照片等
 * 合并进页面。公开网站上不会请求这个文件，访客永远只看到公开版。
 *
 * private/ 文件夹已写进 .gitignore，不会被提交到公开仓库。 */
(function () {
  'use strict';

  var LOCAL = location.protocol === 'file:' ||
    /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(location.hostname);

  // 这些字段只该出现在 private/details.js 里
  var PRIVATE_FIELDS = {
    competitions: ['project', 'students', 'advisor', 'files', 'note', 'photos'],
    students: ['photo', 'note', 'thesis', 'destination'],
    projects: ['budget', 'note', 'files']
  };
  var KIND_NAMES = { competitions: '竞赛', students: '学生', honors: '荣誉', papers: '论文', patents: '专利', news: '动态', projects: '项目' };

  var H = window.HOMEPAGE = { local: LOCAL, full: false, warnings: [] };

  function label(kind, item) {
    return (KIND_NAMES[kind] || kind) + '「' + (item.name || item.title || item.text || item.id || '未命名') + '」';
  }

  function merge(S, D) {
    // 1. 公开条目 + 本地详细信息（按 id 对应）
    Object.keys(PRIVATE_FIELDS).forEach(function (kind) {
      var details = D[kind] || {};
      (S[kind] || []).forEach(function (item) {
        if (item.id && details[item.id]) {
          Object.keys(details[item.id]).forEach(function (k) { item[k] = details[item.id][k]; });
        }
      });
    });
    // 2. 只在本地记录、不公开的条目
    var extra = D.extra || {};
    Object.keys(extra).forEach(function (kind) {
      (extra[kind] || []).forEach(function (item) {
        item.localOnly = true;
        (S[kind] = S[kind] || []).push(item);
      });
    });
  }

  function check(S, D) {
    var w = H.warnings;
    // 公开文件里混进了私密字段
    Object.keys(PRIVATE_FIELDS).forEach(function (kind) {
      (S[kind] || []).forEach(function (item) {
        var leaked = PRIVATE_FIELDS[kind].filter(function (f) { return item[f] != null && item[f] !== '' && !(Array.isArray(item[f]) && !item[f].length); });
        if (leaked.length) w.push({ level: 'danger', text: 'content.js 里' + label(kind, item) + '含有会被公开的字段：' + leaked.join('、') + '。请移到 private/details.js。' });
      });
    });
    if (!D) return;
    // 公开条目缺少 id 或本地记录
    (S.competitions || []).forEach(function (c) {
      if (c.hide) return;
      if (!c.id) { w.push({ level: 'todo', text: label('competitions', c) + '缺少 id，无法对应本地记录。' }); return; }
      var d = (D.competitions || {})[c.id];
      if (!d) w.push({ level: 'todo', text: label('competitions', c) + '（' + c.id + '）还没有本地记录。' });
      else if (!d.advisor) w.push({ level: 'todo', text: label('competitions', c) + '（' + c.id + '）还没填指导教师排名。' });
    });
    (S.students || []).forEach(function (s) {
      if (!s.hide && !s.id) w.push({ level: 'todo', text: label('students', s) + '缺少 id，无法对应本地照片。' });
    });
    // 本地记录里有、公开文件里已删掉的 id
    Object.keys(PRIVATE_FIELDS).forEach(function (kind) {
      var ids = (S[kind] || []).map(function (x) { return x.id; });
      Object.keys(D[kind] || {}).forEach(function (id) {
        if (ids.indexOf(id) < 0) w.push({ level: 'todo', text: 'private/details.js 里的' + (KIND_NAMES[kind] || kind) + ' id「' + id + '」在 content.js 中找不到对应条目。' });
      });
    });
  }

  function loadScript(src, done) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { done(true); };
    s.onerror = function () { done(false); };
    document.head.appendChild(s);
  }

  H.ready = function (cb) {
    var S = window.SITE || {};
    if (!LOCAL) { cb(); return; }
    loadScript('private/details.js', function (ok) {
      if (ok) {
        var D = window.PRIVATE || {};
        H.full = true;
        check(S, D);   // 先检查公开文件本身，再合并
        merge(S, D);
      } else {
        check(S, null);
        H.warnings.unshift({ level: 'todo', text: '没有找到 private/details.js，当前显示的是公开版。' });
      }
      // 私密文章（没有也没关系）
      loadScript('private/posts/index.js', function () { cb(); });
    });
  };

  // 文章：公开的 + 本地时再加上私密的，按日期从新到旧
  H.posts = function () {
    var list = (window.POSTS_PUBLIC || []).slice();
    if (LOCAL) list = list.concat(window.POSTS_PRIVATE || []);
    return list.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  };

  // 本地提示条
  H.banner = function () {
    if (!LOCAL) return '';
    var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var w = H.warnings;
    var danger = w.filter(function (x) { return x.level === 'danger'; });
    var todo = w.filter(function (x) { return x.level !== 'danger'; });
    var list = function (arr) { return '<ul>' + arr.map(function (x) { return '<li>' + esc(x.text) + '</li>'; }).join('') + '</ul>'; };
    return '<div class="local-banner' + (danger.length ? ' is-danger' : '') + '"><div class="wrap">' +
      '<p class="local-title"><strong>' + (H.full ? '本地详细版' : '本地预览') + '</strong>' +
      '<span>只有在你自己电脑上打开才会看到这条提示和详细信息；公开网站只显示公开内容。</span></p>' +
      (danger.length ? '<p class="local-sub">需要处理（' + danger.length + '）</p>' + list(danger) : '') +
      (todo.length ? '<details><summary>待补充记录（' + todo.length + '）</summary>' + list(todo) + '</details>' : '') +
      '</div></div>';
  };
})();
