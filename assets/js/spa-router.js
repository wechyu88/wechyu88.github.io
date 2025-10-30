// SPA路由系统 - 单页应用路由管理
// 侧边栏固定，只改变右侧内容

class SPARouter {
    constructor() {
        this.routes = {};
        this.currentPage = '';
        this.init();
    }

    init() {
        // 监听hash变化
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    // 注册路由
    register(path, handler) {
        this.routes[path] = handler;
    }

    // 处理路由
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const container = document.getElementById('page-container');

        if (!container) return;

        // 查找匹配的路由
        let handler = this.routes[hash];

        // 支持动态路由，如 /research/:id
        if (!handler) {
            for (const route in this.routes) {
                const regex = this.pathToRegex(route);
                const match = hash.match(regex);
                if (match) {
                    handler = this.routes[route];
                    // 提取参数
                    const params = this.extractParams(route, hash);
                    handler(params);
                    this.currentPage = hash;
                    this.updateActiveNav(hash);
                    return;
                }
            }
        }

        // 如果找到路由处理器
        if (handler) {
            handler();
            this.currentPage = hash;
            this.updateActiveNav(hash);
        } else {
            // 404
            container.innerHTML = '<h1>页面未找到</h1><p>请检查链接是否正确。</p>';
        }

        // 滚动到顶部
        window.scrollTo(0, 0);
    }

    // 将路由路径转换为正则表达式
    pathToRegex(path) {
        return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)') + '$');
    }

    // 提取路由参数
    extractParams(route, path) {
        const routeParts = route.split('/');
        const pathParts = path.split('/');
        const params = {};

        routeParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.slice(1);
                params[paramName] = pathParts[index];
            }
        });

        return params;
    }

    // 更新导航栏激活状态
    updateActiveNav(hash) {
        // 移除所有激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 添加当前页面激活状态
        const activeLink = document.querySelector(`a[href="#${hash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // 导航到指定页面
    navigate(path) {
        window.location.hash = path;
    }
}

// 页面渲染器
class PageRenderer {
    constructor() {
        this.data = siteData;
    }

    // 渲染首页
    renderHome() {
        const p = this.data.personal;
        return `
            <!-- 个人简介卡片 -->
            <section class="content-card fade-in editable-section" data-section="personal-intro">
                <div style="display: flex; gap: 30px; align-items: start;">
                    <div style="flex: 1;">
                        <h1 style="margin-top: 0;">${p.name}</h1>
                        <h3 style="color: #7f8c8d; margin: 10px 0;">${p.nameEn}</h3>
                        <p><strong>职称：</strong>${p.title}</p>
                        <p><strong>单位：</strong>${p.affiliation}</p>
                        <p><strong>邮箱：</strong>${p.email}</p>

                        <div style="margin-top: 20px;">
                            <h3>研究兴趣</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                <span class="tag">人工智能</span>
                                <span class="tag">计算机视觉</span>
                                <span class="tag">机器学习</span>
                                <span class="tag">深度学习</span>
                                <span class="tag">机器人技术</span>
                                <span class="tag">数据挖掘</span>
                            </div>
                        </div>
                    </div>
                    <div style="width: 200px; flex-shrink: 0;">
                        <img src="${p.avatar}" alt="${p.name}" style="width: 100%; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <h3>个人简介</h3>
                    <p>${p.bio}</p>
                    <p>${p.introduction}</p>
                </div>
            </section>

            <!-- 成果统计 -->
            <section class="content-card fade-in editable-section" data-section="stats">
                <h2>成果概览</h2>
                <div class="research-grid">
                    <div class="research-item" style="cursor: pointer;" onclick="router.navigate('/achievements/all')">
                        <div class="research-content" style="text-align: center; padding: 2rem;">
                            <h3 style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 0.5rem;">${this.data.achievements.journals.length + this.data.achievements.conferences.length}+</h3>
                            <p>发表论文</p>
                        </div>
                    </div>
                    <div class="research-item" style="cursor: pointer;" onclick="router.navigate('/achievements/all')">
                        <div class="research-content" style="text-align: center; padding: 2rem;">
                            <h3 style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 0.5rem;">${this.data.achievements.patents.length}+</h3>
                            <p>授权专利</p>
                        </div>
                    </div>
                    <div class="research-item" style="cursor: pointer;" onclick="router.navigate('/achievements/all')">
                        <div class="research-content" style="text-align: center; padding: 2rem;">
                            <h3 style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 0.5rem;">${this.data.achievements.projects.length}+</h3>
                            <p>科研项目</p>
                        </div>
                    </div>
                    <div class="research-item" style="cursor: pointer;" onclick="router.navigate('/achievements/all')">
                        <div class="research-content" style="text-align: center; padding: 2rem;">
                            <h3 style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 0.5rem;">${this.data.achievements.awards.length}+</h3>
                            <p>获奖荣誉</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 研究领域 -->
            <section class="content-card fade-in editable-section" data-section="research-areas">
                <h2>研究领域</h2>
                <div class="research-grid">
                    ${this.data.research.map(r => `
                        <div class="research-item editable-item" data-type="research" data-id="${r.id}">
                            <div class="research-image">
                                <img src="${r.image}" alt="${r.title}">
                            </div>
                            <div class="research-content">
                                <h4>${r.icon} ${r.title}</h4>
                                <p>${r.description}</p>
                                <a href="#/research/${r.id}" class="btn btn-primary">了解更多</a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- 最新动态 -->
            <section class="content-card fade-in editable-section" data-section="news">
                <h2>最新动态</h2>
                <ul class="achievement-list">
                    ${this.data.news.slice(0, 3).map(n => `
                        <li class="achievement-item editable-item" data-type="news" data-id="${n.title}">
                            <h4>${n.title}</h4>
                            <p class="meta">${n.date}</p>
                            <p>${n.content}</p>
                        </li>
                    `).join('')}
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="#/news" class="btn btn-primary">查看更多动态</a>
                </div>
            </section>
        `;
    }

    // 渲染研究方向详情页
    renderResearch(params) {
        const research = this.data.research.find(r => r.id === params.id);
        if (!research) {
            return '<h1>研究方向未找到</h1>';
        }

        return `
            <header class="page-header editable-section" data-section="research-header-${research.id}">
                <h1>${research.icon} ${research.title}</h1>
                <p>${research.titleEn}</p>
            </header>

            <section class="content-card editable-section" data-section="research-content-${research.id}">
                <h2>研究方向介绍</h2>
                <p>${research.content}</p>
            </section>

            ${research.topics && research.topics.length > 0 ? `
            <section class="content-card editable-section" data-section="research-topics-${research.id}">
                <h2>研究课题</h2>
                <div class="research-grid">
                    ${research.topics.map((topic, index) => `
                        <div class="research-item editable-item" data-type="topic" data-parent="${research.id}" data-index="${index}">
                            <div class="research-image">
                                <img src="${topic.image}" alt="${topic.title}">
                            </div>
                            <div class="research-content">
                                <h4>${topic.title}</h4>
                                <p>${topic.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
            ` : ''}

            ${research.students && research.students.length > 0 ? `
            <section class="content-card editable-section" data-section="research-students-${research.id}">
                <h2>参与学生</h2>
                <div class="students-grid">
                    ${research.students.map((student, index) => `
                        <div class="student-card editable-item" data-type="research-student" data-parent="${research.id}" data-index="${index}">
                            <div class="student-photo">
                                <img src="${student.image}" alt="${student.name}">
                            </div>
                            <div class="student-info">
                                <h4>${student.name} <span class="tag">${student.level}</span></h4>
                                <p><strong>方向：</strong>${student.direction}</p>
                                <p><strong>入学年份：</strong>${student.year}</p>
                                <p>${student.intro}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
            ` : ''}
        `;
    }

    // 渲染成果列表页
    renderAchievements(filter = 'all') {
        const achievements = this.data.achievements;
        let journals = achievements.journals;
        let conferences = achievements.conferences;
        let patents = achievements.patents;
        let projects = achievements.projects;

        if (filter !== 'all') {
            journals = journals.filter(j => j.period === filter);
            conferences = conferences.filter(c => c.period === filter);
            patents = patents.filter(p => p.period === filter);
            projects = projects.filter(p => p.period === filter);
        }

        const titleMap = {
            'all': '全部研究成果',
            'work': '工作期间成果',
            'education': '博士硕士期间成果',
            'phd': '博士期间成果',
            'master': '硕士期间成果'
        };

        return `
            <header class="page-header">
                <h1>${titleMap[filter] || '研究成果'}</h1>
                <p>Research Achievements</p>
            </header>

            <!-- 期刊论文 -->
            <section class="content-card editable-section" data-section="journals-${filter}">
                <h2>📄 期刊论文 (${journals.length}篇)</h2>
                <ul class="achievement-list">
                    ${journals.map((j, index) => `
                        <li class="achievement-item editable-item" data-type="journal" data-index="${index}">
                            <h4>${j.title}</h4>
                            <p class="meta">${j.authors}</p>
                            <p class="meta">${j.venue}, ${j.year} | ${j.level}</p>
                            ${j.abstract ? `<p>${j.abstract}</p>` : ''}
                            ${j.doi ? `<p><strong>DOI:</strong> ${j.doi}</p>` : ''}
                            ${j.pdf ? `<p><a href="${j.pdf}" target="_blank" class="btn btn-primary">下载PDF</a></p>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </section>

            <!-- 会议论文 -->
            <section class="content-card editable-section" data-section="conferences-${filter}">
                <h2>📋 会议论文 (${conferences.length}篇)</h2>
                <ul class="achievement-list">
                    ${conferences.map((c, index) => `
                        <li class="achievement-item editable-item" data-type="conference" data-index="${index}">
                            <h4>${c.title}</h4>
                            <p class="meta">${c.authors}</p>
                            <p class="meta">${c.venue}, ${c.year} | ${c.level}</p>
                            ${c.abstract ? `<p>${c.abstract}</p>` : ''}
                            ${c.pdf ? `<p><a href="${c.pdf}" target="_blank" class="btn btn-primary">下载PDF</a></p>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </section>

            <!-- 专利 -->
            <section class="content-card editable-section" data-section="patents-${filter}">
                <h2>🔬 专利 (${patents.length}项)</h2>
                <ul class="achievement-list">
                    ${patents.map((p, index) => `
                        <li class="achievement-item editable-item" data-type="patent" data-index="${index}">
                            <h4>${p.title}</h4>
                            <p class="meta">发明人：${p.inventors}</p>
                            <p class="meta">专利号：${p.number} | 状态：${p.status} | ${p.date}</p>
                            ${p.certificate ? `<p><a href="${p.certificate}" target="_blank" class="btn btn-primary">查看证书</a></p>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </section>

            <!-- 科研项目 -->
            <section class="content-card editable-section" data-section="projects-${filter}">
                <h2>📊 科研项目 (${projects.length}项)</h2>
                <ul class="achievement-list">
                    ${projects.map((p, index) => `
                        <li class="achievement-item editable-item" data-type="project" data-index="${index}">
                            <h4>${p.title}</h4>
                            <p class="meta">项目编号：${p.number} | 角色：${p.role}</p>
                            <p class="meta">时间：${p.startDate} 至 ${p.endDate} | 经费：${p.budget}</p>
                            ${p.description ? `<p>${p.description}</p>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </section>
        `;
    }

    // 渲染竞赛指导页
    renderCompetitions() {
        return `
            <header class="page-header">
                <h1>大学生竞赛指导</h1>
                <p>Undergraduate Student Competitions</p>
            </header>

            <section class="content-card editable-section" data-section="competitions-intro">
                <h2>竞赛指导理念</h2>
                <p>
                    我一直重视通过学科竞赛培养学生的创新能力和实践能力。通过指导学生参加各类竞赛，
                    不仅能够提升学生的专业技能，还能培养团队协作精神和解决实际问题的能力。
                </p>
            </section>

            <section class="content-card editable-section" data-section="competitions-list">
                <h2>竞赛获奖记录</h2>
                ${this.data.competitions.map((c, index) => `
                    <div class="achievement-item editable-item" data-type="competition" data-index="${index}" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h4>${c.name} - ${c.award}</h4>
                        <p class="meta">${c.date} | 项目：${c.project}</p>
                        <p class="meta">学生：${c.students.join(', ')}</p>
                        ${c.description ? `<p>${c.description}</p>` : ''}
                        ${c.images && c.images.length > 0 ? `
                            <div class="image-gallery" style="display: flex; gap: 10px; margin-top: 15px;">
                                ${c.images.map(img => `
                                    <div class="gallery-item" style="flex: 1;">
                                        <img src="${img}" alt="竞赛图片" style="width: 100%; border-radius: 5px;">
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </section>
        `;
    }

    // 渲染教学页面
    renderTeaching(type) {
        const typeMap = {
            'courses': { title: '授课课程', data: this.data.teaching.courses, icon: '📚' },
            'textbooks': { title: '编写教材', data: this.data.teaching.textbooks, icon: '📖' },
            'awards': { title: '教学获奖', data: this.data.teaching.awards, icon: '🏅' }
        };

        const config = typeMap[type];
        if (!config) return '<h1>页面未找到</h1>';

        return `
            <header class="page-header">
                <h1>${config.icon} ${config.title}</h1>
            </header>

            <section class="content-card editable-section" data-section="teaching-${type}">
                <ul class="achievement-list">
                    ${config.data.map((item, index) => {
                        if (type === 'courses') {
                            return `
                                <li class="achievement-item editable-item" data-type="course" data-index="${index}">
                                    <h4>${item.name} (${item.code})</h4>
                                    <p class="meta">学分：${item.credit} | 学时：${item.hours} | 学期：${item.semester} | 层次：${item.level}</p>
                                    ${item.description ? `<p>${item.description}</p>` : ''}
                                </li>
                            `;
                        } else if (type === 'textbooks') {
                            return `
                                <li class="achievement-item editable-item" data-type="textbook" data-index="${index}">
                                    <h4>${item.title}</h4>
                                    <p class="meta">作者：${item.authors}</p>
                                    <p class="meta">出版社：${item.publisher} | 出版日期：${item.date}</p>
                                    ${item.isbn ? `<p class="meta">ISBN：${item.isbn}</p>` : ''}
                                </li>
                            `;
                        } else {
                            return `
                                <li class="achievement-item editable-item" data-type="teaching-award" data-index="${index}">
                                    <h4>${item.title}</h4>
                                    <p class="meta">${item.level} | ${item.date}</p>
                                    ${item.description ? `<p>${item.description}</p>` : ''}
                                </li>
                            `;
                        }
                    }).join('')}
                </ul>
            </section>
        `;
    }

    // 渲染学生页面
    renderStudents(status) {
        const students = this.data.students[status];
        const title = status === 'current' ? '在读学生' : '已毕业学生';

        return `
            <header class="page-header">
                <h1>👨‍🎓 ${title}</h1>
            </header>

            ${['phd', 'master', 'undergraduate'].map(level => {
                const levelTitle = level === 'phd' ? '博士生' : level === 'master' ? '硕士生' : '本科生';
                const list = students[level] || [];

                return list.length > 0 ? `
                    <section class="content-card editable-section" data-section="students-${status}-${level}">
                        <h2>${levelTitle} (${list.length}人)</h2>
                        <div class="students-grid">
                            ${list.map((student, index) => `
                                <div class="student-card editable-item" data-type="student-${status}" data-level="${level}" data-index="${index}">
                                    <div class="student-photo">
                                        <img src="${student.image}" alt="${student.name}">
                                    </div>
                                    <div class="student-info">
                                        <h4>${student.name}</h4>
                                        <p><strong>方向：</strong>${student.direction}</p>
                                        <p><strong>入学年份：</strong>${student.year}</p>
                                        ${status === 'graduated' && student.destination ? `<p><strong>去向：</strong>${student.destination}</p>` : ''}
                                        ${student.intro ? `<p>${student.intro}</p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : '';
            }).join('')}
        `;
    }
}

// 初始化路由
const router = new SPARouter();
const renderer = new PageRenderer();

// 注册所有路由
router.register('/', () => {
    document.getElementById('page-container').innerHTML = renderer.renderHome();
});

router.register('/research/:id', (params) => {
    document.getElementById('page-container').innerHTML = renderer.renderResearch(params);
});

router.register('/achievements/all', () => {
    document.getElementById('page-container').innerHTML = renderer.renderAchievements('all');
});

router.register('/achievements/work', () => {
    document.getElementById('page-container').innerHTML = renderer.renderAchievements('work');
});

router.register('/achievements/education', () => {
    document.getElementById('page-container').innerHTML = renderer.renderAchievements('education');
});

router.register('/competitions', () => {
    document.getElementById('page-container').innerHTML = renderer.renderCompetitions();
});

router.register('/teaching/courses', () => {
    document.getElementById('page-container').innerHTML = renderer.renderTeaching('courses');
});

router.register('/teaching/textbooks', () => {
    document.getElementById('page-container').innerHTML = renderer.renderTeaching('textbooks');
});

router.register('/teaching/awards', () => {
    document.getElementById('page-container').innerHTML = renderer.renderTeaching('awards');
});

router.register('/students/current', () => {
    document.getElementById('page-container').innerHTML = renderer.renderStudents('current');
});

router.register('/students/graduated', () => {
    document.getElementById('page-container').innerHTML = renderer.renderStudents('graduated');
});

console.log('✅ SPA路由系统已加载');
