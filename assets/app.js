/* 页面渲染脚本：读取 content.js 里的 window.SITE 生成页面。
 * 平时只需修改 content.js，不需要改这个文件。 */
(function () {
  'use strict';

  var S = window.SITE || {};
  var P = S.profile || {};

  // ---------- 工具函数 ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // 极简 Markdown：**加粗**、[文字](链接)、空行分段
  function md(s) {
    return String(s || '').trim().split(/\n\s*\n/).map(function (para) {
      var h = esc(para.trim())
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/\n/g, '<br>');
      return '<p>' + h + '</p>';
    }).join('');
  }

  // 是否为本地详细版（只有自己电脑上读到 private/details.js 时为 true）
  function full() { return !!(window.HOMEPAGE && window.HOMEPAGE.full); }
  function localTag(x) { return x && x.localOnly ? '<span class="local-tag">仅本地</span>' : ''; }

  // 文章（公开 + 本地时的私密文章）
  function posts() { return window.HOMEPAGE && window.HOMEPAGE.posts ? window.HOMEPAGE.posts() : (window.POSTS_PUBLIC || []); }
  function postUrl(p) { return 'blog.html#' + encodeURIComponent(p.slug); }
  // 关联到某篇论文 / 项目 / 竞赛的科研记录链接
  function related(field, id) {
    if (!id) return '';
    return posts().filter(function (p) { return p[field] === id; }).map(function (p) {
      return '<span class="dot"></span><a class="vlog-link" href="' + postUrl(p) + '">科研记录：' + esc(p.title) + '</a>' + (p.private ? '<span class="local-tag">仅本地</span>' : '');
    }).join('');
  }

  function shown(list) {
    return (list || []).filter(function (x) { return x && !x.hide; });
  }

  // '2025-07-03' / '2025-07' / '2025' → 可比较的数字
  function dateKey(d) {
    var m = String(d || '').match(/(\d{4})(?:\D(\d{1,2}))?(?:\D(\d{1,2}))?/);
    if (!m) return 0;
    return (+m[1]) * 10000 + (+(m[2] || 0)) * 100 + (+(m[3] || 0));
  }
  function year(d) { var m = String(d || '').match(/\d{4}/); return m ? m[0] : ''; }
  function ym(d) {
    var m = String(d || '').match(/(\d{4})(?:\D(\d{1,2}))?/);
    if (!m) return esc(d || '');
    return m[2] ? m[1] + '.' + (m[2].length < 2 ? '0' + m[2] : m[2]) : m[1];
  }
  function byDateDesc(a, b) { return dateKey(b.date) - dateKey(a.date); }

  // 论文类型（content.js 里 papers 的 type）；期刊不加标签，其他类型在条目后标注
  var PAPER_TAGS = { conference: '会议论文', abstract: '会议摘要', thesis: '学位论文', preprint: '预印本' };
  // 论文级别：数字越小越靠前（CCF A ≈ 中科院 1区 Top；中科院分区 cas 只在本地版有）
  var paperRank = function (p) {
    var s = (p.cas || '') + ' ' + (p.level || ''), r = 9, m = s.match(/中科院\s*(\d)\s*区/);
    if (m) r = +m[1] + (/Top/i.test(s) ? 0 : 0.2);
    if (/CCF\s*A/i.test(s)) r = Math.min(r, 1);
    if (/CCF\s*B/i.test(s)) r = Math.min(r, 1.5);
    if (/CCF\s*C/i.test(s)) r = Math.min(r, 2.5);
    return r;
  };
  function byRankThenDate(a, b) { return (paperRank(a) - paperRank(b)) || byDateDesc(a, b); }

  // 本人署名：第一作者、通信作者（名字后加 *）、共同第一作者（名字后加 #）
  function myNames() { return [P.name, P.nameEn].filter(Boolean); }
  function isMine(a) { return myNames().indexOf(a.replace(/[*#†\s]+$/, '').trim()) >= 0; }
  function isLead(p) {
    var list = String(p.authors || '').split(/[,，、;；]/).map(function (a) { return a.trim(); }).filter(Boolean);
    return list.some(function (a, i) { return isMine(a) && (i === 0 || /[*#]/.test(a)); });
  }
  function authorsHtml(s) {
    return String(s || '').split(/([,，、;；]\s*)/).map(function (a) {
      return isMine(a) ? '<strong>' + esc(a) + '</strong>' : esc(a);
    }).join('');
  }

  function link(url, text) {
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + '</a>';
  }

  function img(src, alt, cls) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async"' +
      (cls ? ' class="' + cls + '"' : '') + '>';
  }

  // 每行都标年份的列表（不按时间排序时用）
  function datedRows(items, item) {
    return '<ol class="rows">' + items.map(function (x) {
      return '<li class="row row-first"><span class="row-date">' + esc(year(x.date)) +
        '</span><div class="row-body">' + item(x) + '</div></li>';
    }).join('') + '</ol>';
  }

  // 按年份分组的列表；item(x) 返回该行右侧 HTML
  function yearRows(items, item) {
    var last = null;
    return '<ol class="rows">' + items.map(function (x) {
      var y = year(x.date);
      var label = y === last ? '' : y;
      last = y;
      return '<li class="row' + (label ? ' row-first' : '') + '"><span class="row-date">' + esc(label) +
        '</span><div class="row-body">' + item(x) + '</div></li>';
    }).join('') + '</ol>';
  }

  // 科研项目 / 学生项目共用：按开始年份排序（years: '2021 – 2024' 取第一个年份）
  function projectRows(items) {
    var list = shown(items).map(function (p) { p.date = p.date || p.years; return p; }).sort(byDateDesc);
    if (!list.length) return '';
    var row = function (p) {
      var meta = [p.source, p.number, p.role, p.status].filter(Boolean).map(esc).join('<span class="dot"></span>');
      return '<p class="row-title">' + esc(p.title) + localTag(p) + '</p>' +
        (meta || related('project', p.id) ? '<p class="row-meta">' + meta + related('project', p.id) + '</p>' : '') +
        (full() && (p.budget || p.note || (p.files || []).length) ? '<div class="private-box">' +
          (p.budget ? '<p class="row-meta">经费：' + esc(p.budget) + '</p>' : '') +
          (p.note ? '<p class="row-meta">备注：' + esc(p.note) + '</p>' : '') +
          ((p.files || []).length ? '<p class="row-meta">材料：' + p.files.map(function (f) { return link(f, f.split('/').pop()); }).join('<span class="dot"></span>') + '</p>' : '') +
          '</div>' : '');
    };
    return '<ol class="rows">' + list.map(function (p) {
      return '<li class="row row-wide"><span class="row-date row-date-wide">' + esc(p.years || year(p.date)) + '</span><div class="row-body">' + row(p) + '</div></li>';
    }).join('') + '</ol>';
  }

  // ---------- 各栏目 ----------
  var SECTIONS = {
    news: {
      zh: '最新动态', en: 'News',
      html: function () {
        var items = shown(S.news).map(function (n) { return { date: n.date, text: esc(n.text) }; });
        shown(S.competitions).forEach(function (c) {
          items.push({ date: c.date, text: '指导学生获' + esc(c.name) + ' <em>' + esc(c.award) + '</em>' });
        });
        shown(S.honors).forEach(function (h) {
          items.push({ date: h.date, text: '获' + esc(h.title) });
        });
        shown(S.patentList).forEach(function (p) {   // 只在本地版有
          items.push({ date: p.date, text: '发明专利授权：' + esc(p.title) });
        });
        shown(S.projects).forEach(function (p) {
          items.push({ date: p.date || p.years, text: '项目立项：' + esc(p.title) + (p.source ? '（' + esc(p.source) + '）' : '') });
        });
        shown(S.papers).filter(isLead).forEach(function (p) {   // 只发布本人第一 / 通信 / 共同第一作者的论文
          items.push({ date: p.date, text: '论文发表：' + esc(p.title) + (p.venue ? '，<i>' + esc(p.venue) + '</i>' : '') });
        });
        items.sort(byDateDesc);
        items = items.slice(0, S.newsCount || 6);
        if (!items.length) return '';
        return '<ol class="rows">' + items.map(function (n) {
          return '<li class="row"><span class="row-date">' + ym(n.date) + '</span><div class="row-body"><p class="row-title row-plain">' + n.text + '</p></div></li>';
        }).join('') + '</ol>';
      }
    },

    experience: {
      zh: '经历', en: 'Experience',
      html: function () {
        var edu = shown(S.education), work = shown(S.work), out = '';
        function block(title, list, line) {
          if (!list.length) return '';
          return '<h3 class="sub">' + title + '</h3><ol class="rows">' + list.map(function (x) {
            return '<li class="row row-wide"><span class="row-date row-date-wide">' + esc(x.years) + '</span><div class="row-body">' + line(x) + '</div></li>';
          }).join('') + '</ol>';
        }
        out += block('工作', work, function (w) {
          return '<p class="row-title">' + esc(w.position) + '</p><p class="row-meta">' + esc(w.place) + '</p>';
        });
        out += block('教育', edu, function (e) {
          return '<p class="row-title">' + esc(e.degree) + ' · ' + esc(e.major) + '</p><p class="row-meta">' + esc(e.school) + '</p>';
        });
        return out;
      }
    },

    research: {
      zh: '研究方向', en: 'Research',
      html: function () {
        var list = shown(S.research);
        if (!list.length) return '';
        return '<div class="cards">' + list.map(function (r, i) {
          return '<article class="card"><span class="card-no">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
            '<h3 class="card-title">' + esc(r.title) + '</h3>' +
            (r.titleEn ? '<p class="card-en">' + esc(r.titleEn) + '</p>' : '') +
            (r.image ? img(r.image, r.title, 'card-img') : '') +
            '<p class="card-text">' + esc(r.text) + '</p></article>';
        }).join('') + '</div>';
      }
    },

    papers: {
      zh: '论文', en: 'Publications',
      html: function () {
        var papers = shown(S.papers);
        function paper(p) {
          var extra = [];
          if (PAPER_TAGS[p.type]) extra.push(PAPER_TAGS[p.type]);
          if (p.level) extra.push(esc(p.level));
          if (full() && p.cas) extra.push(esc(p.cas) + '<span class="local-tag">仅本地</span>');
          if (p.doi) extra.push(link('https://doi.org/' + p.doi, 'DOI'));
          if (p.pdf) extra.push(link(p.pdf, 'PDF'));
          if (p.url) extra.push(link(p.url, '链接'));
          return '<p class="row-title">' + esc(p.title) + localTag(p) + '</p>' +
            '<p class="row-meta">' + authorsHtml(p.authors) + '</p>' +
            '<p class="row-meta"><i>' + esc(p.venue) + '</i>' + (extra.length ? '<span class="dot"></span>' + extra.join('<span class="dot"></span>') : '') + related('paper', p.id) + '</p>';
        }
        // 期刊、会议混排：本人第一 / 通信 / 共同第一作者在前，其余在后；各自再按级别、时间排序
        if (!papers.length) return '';
        var lead = papers.filter(isLead).sort(byRankThenDate);
        var other = papers.filter(function (p) { return !isLead(p); }).sort(byRankThenDate);
        var both = lead.length && other.length;
        return '<p class="paper-legend">共 ' + papers.length + ' 篇；加粗为本人，* 通信作者，# 共同第一作者</p>' +
          (lead.length ? (both ? '<h3 class="sub">第一作者 / 通信作者 / 共同第一作者 <span class="count">' + lead.length + '</span></h3>' : '') + datedRows(lead, paper) : '') +
          (other.length ? (both ? '<h3 class="sub">合作论文 <span class="count">' + other.length + '</span></h3>' : '') + datedRows(other, paper) : '');
      }
    },

    patents: {
      zh: '专利', en: 'Patents',
      html: function () {
        // 公开版只显示数量；本地版再列出 private/details.js 里的清单
        var list = shown(S.patentList).sort(byDateDesc);
        var n = full() && list.length ? list.length : (S.patentCount || 0);
        if (!n) return '';
        return '<p class="lead">已授权发明专利 <strong>' + n + '</strong> 项</p>' + (full() && list.length ? yearRows(list, function (p) {
          return '<p class="row-title">' + esc(p.title) + '<span class="local-tag">仅本地</span></p>' +
            '<p class="row-meta">' + authorsHtml(p.inventors) + '</p>' +
            '<p class="row-meta">' + esc(p.number) + '<span class="dot"></span>' + esc(p.status) +
            (p.file ? '<span class="dot"></span>' + link(p.file, '证书') : '') + '</p>';
        }) : '');
      }
    },

    projects: {
      zh: '科研项目', en: 'Projects',
      html: function () { return projectRows(S.projects); }
    },

    studentProjects: {
      zh: '学生项目', en: 'Student Projects',
      html: function () { return projectRows(S.studentProjects); }
    },

    software: {
      zh: '软件著作权', en: 'Software',
      html: function () {
        // 公开版只显示数量；本地版再列出 private/details.js 里的清单
        var list = (S.softwareList || []).slice().sort(byDateDesc);
        var n = full() && list.length ? list.length : (S.softwareCount || 0);
        if (!n) return '';
        return '<p class="lead">已登记计算机软件著作权 <strong>' + n + '</strong> 项</p>' + (full() && list.length ? yearRows(list, function (x) {
          return '<p class="row-title">' + esc(x.title) + '<span class="local-tag">仅本地</span></p>' +
            '<p class="row-meta">著作权人：' + esc(x.owners || '') + '</p>' +
            '<p class="row-meta">' + esc(x.number || '') + (x.file ? '<span class="dot"></span>' + link(x.file, '证书') : '') + '</p>';
        }) : '');
      }
    },

    teaching: {
      zh: '教学', en: 'Teaching',
      html: function () {
        var courses = shown(S.courses), books = shown(S.textbooks).sort(byDateDesc), out = '';
        if (courses.length) {
          out += '<h3 class="sub">授课课程</h3><ul class="plain-list">' + courses.map(function (c) {
            return '<li><span class="pl-main">' + esc(c.name) + '</span><span class="pl-tag">' + esc(c.level || '') + '</span>' +
              (c.note ? '<span class="pl-note">' + esc(c.note) + '</span>' : '') + '</li>';
          }).join('') + '</ul>';
        }
        if (books.length) {
          out += '<h3 class="sub">编写教材</h3>' + yearRows(books, function (b) {
            return '<p class="row-title">' + esc(b.title) + '</p><p class="row-meta">' +
              esc(b.publisher) + (b.role ? '<span class="dot"></span>' + esc(b.role) : '') + '</p>';
          });
        }
        return out;
      }
    },

    students: {
      zh: '学生', en: 'Students',
      html: function () {
        var list = shown(S.students), out = '';
        ['在读', '已毕业'].forEach(function (st) {
          var group = list.filter(function (s) { return (s.status || '在读') === st; });
          if (!group.length) return;
          out += '<h3 class="sub">' + st + ' <span class="count">' + group.length + '</span></h3>';
          if (!full()) {
            // 公开版：只列姓名，不放照片
            out += '<ul class="names">' + group.map(function (s) {
              return '<li><span class="person-name">' + esc(s.name) + '</span><span class="person-meta">' +
                esc([s.level, s.year].filter(Boolean).join(' · ')) + '</span></li>';
            }).join('') + '</ul>';
            return;
          }
          // 本地详细版：带照片和备注
          out += '<div class="people">' + group.map(function (s) {
            var ph = s.photo
              ? '<button class="frame" data-view="' + esc(s.photo) + '" data-cap="' + esc(s.name) + '">' + img(s.photo, s.name) + '</button>'
              : '<div class="frame frame-empty"><span>' + esc((s.name || '').slice(-2)) + '</span></div>';
            return '<figure class="person">' + ph + '<figcaption><span class="person-name">' + esc(s.name) + localTag(s) + '</span>' +
              '<span class="person-meta">' + esc([s.level, s.year].filter(Boolean).join(' · ')) + '</span>' +
              (s.thesis ? '<span class="person-meta">论文：' + esc(s.thesis) + '</span>' : '') +
              (s.destination ? '<span class="person-meta">去向：' + esc(s.destination) + '</span>' : '') +
              (s.note ? '<span class="person-meta">' + esc(s.note) + '</span>' : '') + '</figcaption></figure>';
          }).join('') + '</div>';
        });
        return out;
      }
    },

    competitions: {
      zh: '竞赛指导', en: 'Competitions',
      html: function () {
        var list = shown(S.competitions).sort(byDateDesc);
        if (!list.length) return '';
        var pub = list.filter(function (c) { return !c.localOnly; }).length;
        var lead = '指导学生获奖 <strong>' + pub + '</strong> 项';
        if (full()) {   // 本地版：按指导教师排名区分（只有一位指导教师时也记为第一指导教师）
          var first = list.filter(function (c) { return /第一/.test(c.advisor || ''); }).length;
          var other = list.filter(function (c) { return c.advisor && !/第一/.test(c.advisor); }).length;
          var none = list.length - first - other;
          lead += '<span class="dot"></span>第一指导教师 <strong>' + first + '</strong> 项<span class="dot"></span>非第一指导教师 <strong>' + other + '</strong> 项' +
            (none ? '<span class="dot"></span>未填 ' + none + ' 项' : '');
        }
        return '<p class="lead">' + lead + '</p>' + yearRows(list, function (c) {
          var rel = related('competition', c.id);
          var head = '<p class="row-title">' + esc(c.name) + '<span class="award">' + esc(c.award) + '</span>' + localTag(c) + '</p>' +
            (rel ? '<p class="row-meta">' + rel.replace('<span class="dot"></span>', '') + '</p>' : '');
          if (!full()) return head;   // 公开版只显示比赛名称和奖项
          var photos = (c.photos || []).filter(Boolean);
          var files = (c.files || []).filter(Boolean);
          return head +
            '<div class="private-box">' +
            (c.advisor ? '<p class="row-meta">指导教师：' + esc(c.advisor) + '</p>' : '<p class="row-meta private-missing">指导教师排名：未填写</p>') +
            (c.project ? '<p class="row-meta">作品：' + esc(c.project) + '</p>' : '') +
            (c.students ? '<p class="row-meta">学生：' + esc(Array.isArray(c.students) ? c.students.join('、') : c.students) + '</p>' : '') +
            (c.note ? '<p class="row-meta">备注：' + esc(c.note) + '</p>' : '') +
            (files.length ? '<p class="row-meta">材料：' + files.map(function (f) {
              return link(f, f.split('/').pop());
            }).join('<span class="dot"></span>') + '</p>' : '') +
            (photos.length ? '<div class="thumbs">' + photos.map(function (p) {
              return '<button class="thumb" data-view="' + esc(p) + '" data-cap="' + esc(c.name + ' ' + c.award) + '">' + img(p, c.name) + '</button>';
            }).join('') + '</div>' : '') +
            '</div>';
        });
      }
    },

    honors: {
      zh: '荣誉', en: 'Honors',
      html: function () {
        var list = shown(S.honors).sort(byDateDesc);
        if (!list.length) return '';
        return yearRows(list, function (h) {
          var files = (h.files || []).filter(Boolean);
          var comp = h.competition && shown(S.competitions).filter(function (c) { return c.id === h.competition; })[0];
          return '<p class="row-title">' + esc(h.title) + localTag(h) + '</p>' +
            '<p class="row-meta">' + esc(h.level || '') + (h.file ? '<span class="dot"></span>' + link(h.file, '证书') : '') + '</p>' +
            (full() && (files.length || comp || h.note) ? '<div class="private-box">' +
              (comp ? '<p class="row-meta">对应学生获奖：' + esc(comp.name) + ' ' + esc(comp.award) + '</p>' : '') +
              (h.note ? '<p class="row-meta">备注：' + esc(h.note) + '</p>' : '') +
              (files.length ? '<p class="row-meta">材料：' + files.map(function (f) { return link(f, f.split('/').pop()); }).join('<span class="dot"></span>') + '</p>' : '') +
              '</div>' : '');
        });
      }
    },

    posts: {
      zh: '随笔', en: 'Journal',
      html: function () {
        var list = posts();
        if (!list.length) return '';
        var n = S.postsCount || 4;
        return '<div class="post-cards">' + list.slice(0, n).map(function (p) {
          return '<a class="post-card" href="' + postUrl(p) + '">' +
            (p.cover ? '<span class="post-card-img">' + img(p.cover, p.title) + '</span>' : '') +
            '<span class="post-card-meta">' + esc(p.category || '') + '<span class="dot"></span>' + esc(String(p.date).replace(/-/g, '.')) +
            (p.private ? '<span class="local-tag">仅本地</span>' : '') + '</span>' +
            '<span class="post-card-title">' + esc(p.title) + '</span>' +
            (p.summary ? '<span class="post-card-sum">' + esc(p.summary) + '</span>' : '') + '</a>';
        }).join('') + '</div>' +
        '<p class="post-more"><a href="blog.html">全部 ' + list.length + ' 篇 →</a></p>';
      }
    },

    gallery: {
      zh: '相册', en: 'Gallery',
      html: function () {
        var list = shown(S.gallery);
        if (!list.length) return '';
        return '<div class="gallery">' + list.map(function (g) {
          return '<figure><button class="frame" data-view="' + esc(g.src) + '" data-cap="' + esc(g.caption || '') + '">' +
            img(g.src, g.caption) + '</button>' + (g.caption ? '<figcaption>' + esc(g.caption) + '</figcaption>' : '') + '</figure>';
        }).join('') + '</div>';
      }
    },

    contact: {
      zh: '联系', en: 'Contact',
      html: function () {
        var rows = [];
        if (P.email) rows.push(['邮箱', '<a href="mailto:' + esc(P.email) + '">' + esc(P.email) + '</a>']);
        if (P.phone) rows.push(['电话', esc(P.phone)]);
        if (P.address) rows.push(['地址', esc(P.address)]);
        if (P.postcode) rows.push(['邮编', esc(P.postcode)]);
        var links = shown(P.links).filter(function (l) { return l.url; });
        if (links.length) rows.push(['主页', links.map(function (l) { return link(l.url, l.label); }).join('<span class="dot"></span>')]);
        if (!rows.length) return '';
        return '<dl class="contact">' + rows.map(function (r) {
          return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>';
        }).join('') + '</dl>';
      }
    }
  };

  // ---------- 首屏 ----------
  function hero() {
    var stats = [
      ['论文', shown(S.papers).length],
      ['专利', full() && S.patentList ? shown(S.patentList).length : (S.patentCount || 0)],
      ['项目', shown(S.projects).length],
      ['学生', shown(S.students).length],
      ['竞赛获奖', shown(S.competitions).length]
    ].filter(function (s) { return s[1] > 0; });
    var links = shown(P.links).filter(function (l) { return l.url; });

    return '<section class="hero wrap">' +
      '<div class="hero-text">' +
        '<p class="eyebrow">' + esc([P.affiliation, P.department].filter(Boolean).join(' · ')) + '</p>' +
        '<h1 class="hero-name">' + esc(P.name) + '</h1>' +
        '<p class="hero-en">' + esc(P.nameEn || '') + (P.title ? '<span class="hero-title">' + esc(P.title) + '</span>' : '') + '</p>' +
        '<div class="hero-bio">' + md(P.bio) + '</div>' +
        (P.interests && P.interests.length ? '<p class="interests">' + P.interests.map(function (x) { return '<span class="it">' + esc(x) + '</span>'; }).join('<span class="slash">/</span>') + '</p>' : '') +
        '<p class="hero-links">' +
          (P.email ? '<a href="mailto:' + esc(P.email) + '">' + esc(P.email) + '</a>' : '') +
          links.map(function (l) { return link(l.url, l.label); }).join('') +
        '</p>' +
      '</div>' +
      (P.avatar ? '<div class="hero-photo"><div class="portrait">' + img(P.avatar, P.name) + '</div></div>' : '') +
      (stats.length ? '<ul class="stats">' + stats.map(function (s) {
        return '<li><span class="stat-n">' + s[1] + '</span><span class="stat-l">' + s[0] + '</span></li>';
      }).join('') + '</ul>' : '') +
    '</section>';
  }

  // ---------- 组装 ----------
  function render() {
    var main = document.getElementById('top');
    var nav = document.getElementById('nav');
    var html = hero(), navHtml = '', n = 0;

    (S.sections || Object.keys(SECTIONS)).forEach(function (key) {
      var sec = SECTIONS[key];
      if (!sec) return;
      var body = sec.html();
      if (!body) return;
      n++;
      html += '<section class="section" id="' + key + '"><div class="wrap section-grid">' +
        '<header class="section-head"><span class="section-no">' + (n < 10 ? '0' : '') + n + '</span>' +
        '<h2>' + sec.zh + '</h2><p class="section-en">' + sec.en + '</p></header>' +
        '<div class="section-body">' + body + '</div></div></section>';
      navHtml += '<a href="#' + key + '" data-key="' + key + '">' + sec.zh + '</a>';
    });

    main.innerHTML = html;
    nav.innerHTML = navHtml;
    document.getElementById('brand').textContent = P.name || '';
    var H = window.HOMEPAGE || {};
    document.getElementById('footer').innerHTML = '<span>' + esc(S.footer || '') + '</span>' +
      '<span class="footer-links">' +
      (H.local ? '<a href="worklog.html">工作日志</a><a href="cv.html">导出简历</a><a href="cv.html#timeline">导出时间线</a>' : '') +
      '<a href="#top">回到顶部 ↑</a></span>';
    if (H.banner) main.insertAdjacentHTML('beforebegin', H.banner());
    if (P.name) document.title = P.name + (P.affiliation ? ' · ' + P.affiliation : '');
  }

  // 图片查看
  function viewer() {
    var dlg = document.getElementById('viewer');
    var im = document.getElementById('viewer-img');
    var cap = document.getElementById('viewer-cap');
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-view]');
      if (t) {
        im.src = t.getAttribute('data-view');
        cap.textContent = t.getAttribute('data-cap') || '';
        if (dlg.showModal) dlg.showModal(); else window.open(im.src);
      } else if (e.target === dlg) {
        dlg.close();
      }
    });
  }

  // 导航高亮当前栏目
  function spy() {
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function (a) { links[a.dataset.key] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === en.target.id); });
        var a = links[en.target.id];
        if (a && a.scrollIntoView && window.innerWidth < 760) a.parentNode.scrollLeft = a.offsetLeft - 16;
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('.section'), function (s) { io.observe(s); });
  }

  function start() {
    render();
    viewer();
    spy();
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  }

  // 主题：content.js 里的 theme（'warm' 默认 / 'white' 白墙 / 'stone' 石灰）
  function loadTheme(cb) {
    var t = S.theme && S.theme !== 'warm' ? S.theme : '';
    if (!t) { cb(); return; }
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'assets/theme-' + t + '.css';
    l.onload = l.onerror = function () { cb(); };
    // 紧跟在 style.css 后面，保证主题样式覆盖基础样式
    var base = document.querySelector('link[href$="style.css"]');
    if (base) base.insertAdjacentElement('afterend', l); else document.head.appendChild(l);
  }

  loadTheme(function () {
    if (window.HOMEPAGE) window.HOMEPAGE.ready(start); else start();
  });
})();
