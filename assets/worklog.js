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

  function dayWeight(day) {
    return day.sessions.reduce(function (n, s) { return n + s.prompts.length; }, 0);
  }
  function level(n) { return n === 0 ? 0 : n <= 3 ? 1 : n <= 8 ? 2 : n <= 20 ? 3 : 4; }
  function projects(day) {
    var seen = {};
    day.sessions.forEach(function (s) { seen[s.project] = 1; });
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
    return '<section class="wl-days"><p class="wl-days-title">' + title + '</p><ul>' +
      list.map(function (day) {
        return '<li><button class="wl-day' + (day.date === sel ? ' is-sel' : '') + '" data-day="' + day.date + '">' +
          '<span class="wl-day-date">' + day.date.slice(5).replace('-', '.') + ' <em>' + weekday(day.date) + '</em></span>' +
          '<span class="wl-day-meta">' + day.sessions.length + ' 段 · ' + esc(projects(day).join('、')) + '</span></button></li>';
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
      day.sessions.map(function (s) {
        return '<article class="wl-session">' +
          '<header><span class="wl-tool wl-tool-' + (s.tool === 'Codex' ? 'codex' : 'claude') + '">' + esc(s.tool) + '</span>' +
          '<strong>' + esc(s.project) + '</strong><span class="wl-time">' + esc(s.start) + '–' + esc(s.end) + '</span>' +
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
    main.innerHTML = '<div class="wl-side">' + calendar() + dayList() + '</div>' + detail();
  }

  function select(day, scroll) {
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
      return message('<p>此页面仅供本人在本地使用。</p><p><a href="./">返回主页</a></p>');
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
        select(byDate[want] ? want : W.days[0].date, false);

        main.addEventListener('click', function (e) {
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
