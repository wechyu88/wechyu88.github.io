/* 简历 / 时间线：从 content.js 自动生成，可打印为 PDF、下载 Word 或 Markdown。
 * 平时只需修改 content.js，不需要改这个文件。 */
(function () {
  'use strict';

  var S = window.SITE || {};
  var P = S.profile || {};

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shown(list) { return (list || []).filter(function (x) { return x && !x.hide; }); }
  function dateKey(d) {
    var m = String(d || '').match(/(\d{4})(?:\D(\d{1,2}))?(?:\D(\d{1,2}))?/);
    return m ? (+m[1]) * 10000 + (+(m[2] || 0)) * 100 + (+(m[3] || 0)) : 0;
  }
  function byDateDesc(a, b) { return dateKey(b.date) - dateKey(a.date); }
  function year(d) { var m = String(d || '').match(/\d{4}/); return m ? m[0] : ''; }
  function ym(d) {
    var m = String(d || '').match(/(\d{4})(?:\D(\d{1,2}))?/);
    if (!m) return String(d || '');
    return m[2] ? m[1] + '.' + (m[2].length < 2 ? '0' + m[2] : m[2]) : m[1];
  }
  function join(parts, sep) { return parts.filter(Boolean).join(sep); }
  function students(s) { return Array.isArray(s) ? s.join('、') : (s || ''); }
  function today() {
    var d = new Date();
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月';
  }

  /* 文档统一表示为节点列表，再分别输出成 HTML / Markdown：
   *   { h1, en, contact }  { h2 }  { h3 }  { year }
   *   { item: 日期, main, sub, tag }   { list: [ {main, sub, tag} ], ordered }
   *   { line: 文字, cat }  { stamp } */

  function buildCV() {
    var out = [];
    out.push({
      h1: P.name, en: P.nameEn,
      contact: [join([P.title, P.affiliation, P.department], ' · '), P.email, P.phone].filter(Boolean)
    });

    var interests = (P.interests || []).join('、');
    var research = shown(S.research).map(function (r) { return r.title; }).join('、');
    if (interests || research) {
      out.push({ h2: '研究方向' });
      if (research) out.push({ list: [{ main: research }], ordered: false });
      if (interests) out.push({ list: [{ main: '研究兴趣：' + interests }], ordered: false });
    }

    var work = shown(S.work);
    if (work.length) {
      out.push({ h2: '工作经历' });
      work.forEach(function (w) { out.push({ item: w.years, main: w.position, sub: w.place }); });
    }

    var edu = shown(S.education);
    if (edu.length) {
      out.push({ h2: '教育背景' });
      edu.forEach(function (e) { out.push({ item: e.years, main: join([e.degree, e.major], ' · '), sub: e.school }); });
    }

    var projects = shown(S.projects).sort(function (a, b) { return dateKey(b.years || b.date) - dateKey(a.years || a.date); });
    if (projects.length) {
      out.push({ h2: '科研项目（' + projects.length + ' 项）' });
      out.push({ list: projects.map(function (p) {
        return {
          main: p.title + '，' + join([p.source, p.number], '，') + '，' + (p.years || ym(p.date)),
          tag: p.role,
          sub: join([p.status, p.budget ? '经费 ' + p.budget : ''], '；')
        };
      }), ordered: true });
    }

    var papers = shown(S.papers).sort(byDateDesc);
    var journals = papers.filter(function (p) { return p.type !== 'conference'; });
    var confs = papers.filter(function (p) { return p.type === 'conference'; });
    var patents = shown(S.patents).sort(byDateDesc);
    var books = shown(S.textbooks).sort(byDateDesc);
    if (papers.length || patents.length || books.length) {
      out.push({ h2: '学术成果' });
      function paperRef(p) {
        return {
          main: join([p.authors, p.title, join([p.venue, year(p.date)], ', ')], '. ') + '.',
          sub: join([p.doi ? 'DOI: ' + p.doi : ''], ''),
          tag: p.level
        };
      }
      if (journals.length) { out.push({ h3: '期刊论文（' + journals.length + ' 篇）' }); out.push({ list: journals.map(paperRef), ordered: true }); }
      if (confs.length) { out.push({ h3: '会议论文（' + confs.length + ' 篇）' }); out.push({ list: confs.map(paperRef), ordered: true }); }
      if (patents.length) {
        out.push({ h3: '授权专利（' + patents.length + ' 项）' });
        out.push({ list: patents.map(function (p) {
          return { main: join([p.inventors, p.title], '. ') + '.', sub: join([p.number, p.status, p.date], '，') };
        }), ordered: true });
      }
      if (books.length) {
        out.push({ h3: '编写教材（' + books.length + ' 部）' });
        out.push({ list: books.map(function (b) {
          return { main: b.title, sub: join([b.publisher, ym(b.date), b.role], '，') };
        }), ordered: true });
      }
    }

    var courses = shown(S.courses);
    if (courses.length) {
      out.push({ h2: '授课课程' });
      out.push({ list: courses.map(function (c) { return { main: c.name + (c.level ? '（' + c.level + '）' : '') }; }), ordered: false });
    }

    var honors = shown(S.honors).sort(byDateDesc);
    if (honors.length) {
      out.push({ h2: '荣誉奖项' });
      honors.forEach(function (h) { out.push({ item: ym(h.date), main: h.title, tag: h.level }); });
    }

    var comps = shown(S.competitions).sort(byDateDesc);
    if (comps.length) {
      out.push({ h2: '竞赛指导（' + comps.length + ' 项）' });
      out.push({ list: comps.map(function (c) {
        return {
          main: c.name + '，' + ym(c.date) + (c.advisor ? '（' + c.advisor + '）' : ''),
          tag: c.award,
          sub: detail ? join([c.project ? '作品：' + c.project : '', c.students ? '学生：' + students(c.students) : ''], '；') : ''
        };
      }), ordered: true });
    }

    var stu = shown(S.students);
    if (stu.length) {
      out.push({ h2: '学生指导' });
      ['在读', '已毕业'].forEach(function (st) {
        var g = stu.filter(function (s) { return (s.status || '在读') === st; });
        if (!g.length) return;
        out.push({ list: [{
          main: st + '（' + g.length + ' 人）：' + g.map(function (s) {
            return s.name + '（' + join([s.level, s.year], '，') + '）';
          }).join('、')
        }], ordered: false });
      });
    }

    out.push({ stamp: '更新于 ' + today() });
    return out;
  }

  function buildTimeline() {
    var ev = [];
    shown(S.news).forEach(function (n) { ev.push({ date: n.date, cat: '动态', text: n.text }); });
    shown(S.projects).forEach(function (p) { ev.push({ date: p.date || p.years, cat: '项目', text: p.title + (p.source ? '（' + p.source + '）' : '') + (p.role ? '，' + p.role : '') }); });
    shown(S.papers).forEach(function (p) { ev.push({ date: p.date, cat: '论文', text: p.title + (p.venue ? '，' + p.venue : '') }); });
    shown(S.patents).forEach(function (p) { ev.push({ date: p.date, cat: '专利', text: p.title + '（' + p.number + '）' }); });
    shown(S.textbooks).forEach(function (b) { ev.push({ date: b.date, cat: '教材', text: b.title + (b.publisher ? '，' + b.publisher : '') }); });
    shown(S.honors).forEach(function (h) { ev.push({ date: h.date, cat: '荣誉', text: h.title }); });
    shown(S.competitions).forEach(function (c) {
      ev.push({ date: c.date, cat: '竞赛', text: '指导学生获' + c.name + ' ' + c.award + (c.advisor ? '（' + c.advisor + '）' : '') +
        (detail && c.project ? '，作品：' + c.project : '') });
    });
    ev.sort(byDateDesc);

    var out = [{ h1: (P.name || '') + ' 学术时间线', en: P.nameEn ? P.nameEn + ' · Timeline' : '', contact: ['共 ' + ev.length + ' 项'] }];
    var last = null;
    ev.forEach(function (e) {
      var y = year(e.date) || '其他';
      if (y !== last) { out.push({ year: y }); last = y; }
      out.push({ item: ym(e.date), main: e.text, cat: e.cat });
    });
    out.push({ stamp: '生成于 ' + today() });
    return out;
  }

  // ---------- 输出 HTML ----------
  function toHTML(nodes) {
    return nodes.map(function (n) {
      if (n.h1 != null) {
        return '<header><h1>' + esc(n.h1) + '</h1>' + (n.en ? '<p class="cv-en">' + esc(n.en) + '</p>' : '') +
          (n.contact && n.contact.length ? '<p class="cv-contact">' + n.contact.map(esc).join('<span class="sep">　|　</span>') + '</p>' : '') + '</header>';
      }
      if (n.h2) return '<h2>' + esc(n.h2) + '</h2>';
      if (n.h3) return '<h3>' + esc(n.h3) + '</h3>';
      if (n.year) return '<p class="year">' + esc(n.year) + '</p>';
      if (n.stamp) return '<p class="stamp">' + esc(n.stamp) + '</p>';
      if (n.item != null) {
        return '<p class="item"><span class="item-date">' + esc(n.item) + '&nbsp;&nbsp;&nbsp;</span><span>' +
          (n.cat ? '<span class="cat">' + esc(n.cat) + '</span>' : '') + esc(n.main) +
          (n.tag ? ' <span class="tag">' + esc(n.tag) + '</span>' : '') +
          (n.sub ? '<br><span class="muted">' + esc(n.sub) + '</span>' : '') + '</span></p>';
      }
      if (n.list) {
        var tag = n.ordered ? 'ol' : 'ul';
        return '<' + tag + '>' + n.list.map(function (x) {
          return '<li>' + esc(x.main) + (x.tag ? ' <span class="tag">' + esc(x.tag) + '</span>' : '') +
            (x.sub ? '<div class="muted">' + esc(x.sub) + '</div>' : '') + '</li>';
        }).join('') + '</' + tag + '>';
      }
      return '';
    }).join('');
  }

  // ---------- 输出 Markdown ----------
  function toMD(nodes) {
    var lines = [];
    nodes.forEach(function (n) {
      if (n.h1 != null) {
        lines.push('# ' + n.h1, '');
        if (n.en) lines.push(n.en, '');
        if (n.contact && n.contact.length) lines.push(n.contact.join(' | '), '');
      } else if (n.h2) lines.push('', '## ' + n.h2, '');
      else if (n.h3) lines.push('', '### ' + n.h3, '');
      else if (n.year) lines.push('', '## ' + n.year, '');
      else if (n.stamp) lines.push('', '---', '', '*' + n.stamp + '*');
      else if (n.item != null) {
        lines.push('- **' + n.item + '** ' + (n.cat ? '[' + n.cat + '] ' : '') + n.main + (n.tag ? ' — ' + n.tag : '') + (n.sub ? '  \n  ' + n.sub : ''));
      } else if (n.list) {
        n.list.forEach(function (x, i) {
          lines.push((n.ordered ? (i + 1) + '. ' : '- ') + x.main + (x.tag ? ' **' + x.tag + '**' : '') + (x.sub ? '  \n   ' + x.sub : ''));
        });
        lines.push('');
      }
    });
    return lines.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
  }

  // ---------- 输出 Word（Word 能直接打开的 HTML 文档） ----------
  var WORD_CSS =
    'body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;font-size:10.5pt;line-height:1.6;color:#141311}' +
    'h1{font-family:"SimSun","Songti SC",serif;font-size:22pt;margin:0}' +
    'h2{font-family:"SimSun","Songti SC",serif;font-size:13pt;border-bottom:1.2pt solid #141311;margin:16pt 0 6pt;padding-bottom:2pt}' +
    'h3{font-size:10.5pt;margin:8pt 0 2pt;color:#3a372f}' +
    '.cv-en,.cv-contact,.muted,.stamp{color:#3a372f}.tag,.cat{color:#7a5a3a;font-weight:bold}' +
    '.year{font-size:13pt;font-weight:bold;margin:12pt 0 2pt}.item{margin:3pt 0}.item-date{color:#3a372f;margin-right:12pt}' +
    '.cat{margin-right:8pt}.sep{color:#9a958b}.stamp{text-align:right;margin-top:20pt}';

  function download(name, text, type) {
    var blob = new Blob(['﻿' + text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 1000);
  }

  // ---------- 页面 ----------
  var mode = location.hash === '#timeline' ? 'timeline' : 'cv';
  var detail = false;   // 是否包含作品名称与学生名单
  var nodes;

  function render() {
    nodes = mode === 'timeline' ? buildTimeline() : buildCV();
    document.getElementById('paper').innerHTML = toHTML(nodes);
    document.title = (P.name || '') + (mode === 'timeline' ? ' · 学术时间线' : ' · 学术简历');
    ['cv', 'timeline'].forEach(function (m) {
      document.getElementById('tab-' + m).setAttribute('aria-selected', String(m === mode));
    });
  }

  function fileBase() {
    var d = new Date();
    var stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    // 文件名用英文，避免个别浏览器不识别中文文件名
    var who = String(P.nameEn || 'homepage').replace(/[^A-Za-z0-9]+/g, '_');
    return who + (mode === 'timeline' ? '_Timeline_' : '_CV_') + stamp;
  }

  document.querySelector('.cv-tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) return;
    mode = b.getAttribute('data-mode');
    history.replaceState(null, '', mode === 'timeline' ? '#timeline' : '#cv');
    render();
  });
  document.getElementById('opt-detail').addEventListener('change', function (e) { detail = e.target.checked; render(); });
  document.getElementById('btn-print').addEventListener('click', function () { window.print(); });
  document.getElementById('btn-md').addEventListener('click', function () {
    download(fileBase() + '.md', toMD(nodes), 'text/markdown;charset=utf-8');
  });
  document.getElementById('btn-word').addEventListener('click', function () {
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>' + esc(document.title) + '</title><style>' + WORD_CSS + '</style></head><body>' +
      toHTML(nodes) + '</body></html>';
    download(fileBase() + '.doc', html, 'application/msword;charset=utf-8');
  });

  // 只在本地使用：公开网站上不提供导出
  var H = window.HOMEPAGE || {};
  if (!H.local) {
    document.querySelector('.cv-bar').hidden = true;
    document.getElementById('paper').innerHTML = '<p class="muted">此页面仅供本人在本地使用。</p><p><a href="./">返回主页</a></p>';
    return;
  }
  H.ready(function () {
    if (!H.full) document.getElementById('opt-detail').closest('label').hidden = true;
    render();
  });
})();
