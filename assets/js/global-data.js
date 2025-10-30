/**
 * 全局数据管理文件
 * 用于统一管理所有论文、专利、学生等数据，避免重复计数
 * 每个项目都有唯一ID，可在多个页面引用同一项目
 */

// ==================== 全局数据对象 ====================
window.globalData = {
    // 论文数据（期刊+会议）
    papers: [
        {
            id: 'paper-001',
            type: 'journal', // 'journal' 或 'conference'
            title: '基于深度学习的图像识别方法研究',
            authors: '温程远, 张三, 李四',
            venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
            year: 2023,
            level: 'SCI一区',
            doi: '10.1109/TPAMI.2023.xxxxx',
            pdf: 'downloads/papers/paper-001.pdf', // 放在downloads/papers/目录下
            abstract: '本文提出了一种新的基于深度学习的图像识别方法...',
            keywords: ['深度学习', '图像识别', '计算机视觉']
        },
        {
            id: 'paper-002',
            type: 'conference',
            title: '机器人视觉定位系统设计与实现',
            authors: '温程远, 王五',
            venue: 'IEEE International Conference on Robotics and Automation (ICRA)',
            year: 2023,
            level: 'CCF A类',
            pdf: 'downloads/papers/paper-002.pdf',
            abstract: '设计并实现了一套机器人视觉定位系统...'
        }
        // 添加更多论文...
    ],

    // 专利数据
    patents: [
        {
            id: 'patent-001',
            title: '一种智能图像识别装置及方法',
            inventors: '温程远, 张三, 李四',
            number: 'ZL202310xxxxx.X',
            status: '已授权',
            date: '2023-06-15',
            certificate: 'downloads/patents/patent-001-cert.pdf' // 专利证书
        }
        // 添加更多专利...
    ],

    // 学生数据
    students: [
        {
            id: 'student-001',
            name: '张三',
            level: '硕士研究生',
            year: '2021级',
            status: '在读', // '在读' 或 '已毕业'
            research: '计算机视觉',
            photo: 'images/students/student-001.jpg',
            achievements: [
                '发表SCI论文1篇',
                '获得国家奖学金'
            ],
            graduation: {
                thesis: '基于深度学习的目标检测研究',
                destination: '阿里巴巴集团'
            }
        }
        // 添加更多学生...
    ],

    // 竞赛数据
    competitions: [
        {
            id: 'competition-001',
            name: '全国大学生智能车竞赛',
            award: '全国一等奖',
            date: '2023-08',
            project: '智能导航系统',
            students: ['张三', '李四', '王五'],
            images: [
                'images/competitions/comp-001-1.jpg',
                'images/competitions/comp-001-2.jpg'
            ],
            description: '指导学生团队设计并实现了智能导航系统...'
        }
        // 添加更多竞赛...
    ],

    // 荣誉奖项
    honors: [
        {
            id: 'honor-001',
            title: '浙江省科学技术进步奖',
            level: '省部级',
            year: 2023,
            rank: '第一完成人',
            certificate: 'downloads/honors/honor-001-cert.pdf'
        }
        // 添加更多荣誉...
    ],

    // 科研项目
    projects: [
        {
            id: 'project-001',
            title: '基于人工智能的智能制造关键技术研究',
            type: '国家自然科学基金',
            number: '62xxxxxx',
            budget: '30万元',
            duration: '2021-2024',
            role: '项目负责人',
            status: '在研'
        }
        // 添加更多项目...
    ],

    // ==================== 个人信息 ====================
    personalInfo: {
        name: '温程远',
        nameEn: 'Wen Chengyuan',
        title: '副教授',
        affiliation: '浙江海洋大学',
        department: '信息工程学院',
        email: 'wenchengyuan@zjou.edu.cn',
        phone: '+86-580-xxxxxxx',
        address: '浙江省舟山市定海区临城街道海大南路1号',
        postcode: '316022',
        researchInterests: ['人工智能', '计算机视觉', '机器学习', '深度学习', '机器人技术', '数据挖掘']
    },

    // 教育背景
    education: [
        {
            id: 'edu-001',
            degree: '博士',
            major: '计算机科学与技术',
            university: '某某大学',
            duration: '2015-2019',
            thesis: '博士学位论文标题',
            supervisor: '导师姓名'
        },
        {
            id: 'edu-002',
            degree: '硕士',
            major: '计算机应用技术',
            university: '某某大学',
            duration: '2013-2015',
            thesis: '硕士学位论文标题'
        },
        {
            id: 'edu-003',
            degree: '学士',
            major: '计算机科学与技术',
            university: '某某大学',
            duration: '2009-2013'
        }
    ],

    // 工作经历
    workExperience: [
        {
            id: 'work-001',
            position: '副教授',
            institution: '浙江海洋大学',
            department: '信息工程学院',
            duration: '2019年至今',
            description: '从事教学科研工作'
        },
        {
            id: 'work-002',
            position: '访问学者',
            institution: '某某大学',
            department: '计算机科学系',
            duration: '2023-2024',
            description: '进行学术访问和合作研究'
        }
    ],

    // ==================== 全局时间线 ====================
    // 所有重要事件的时间线（自动从其他数据聚合，也可以手动添加）
    timeline: []
    // timeline会通过addTimelineEvent函数动态添加
};

// ==================== 工具函数 ====================

/**
 * 根据ID获取论文
 */
function getPaperById(id) {
    return globalData.papers.find(p => p.id === id);
}

/**
 * 根据类型获取论文列表
 */
function getPapersByType(type) {
    if (!type || type === 'all') return globalData.papers;
    return globalData.papers.filter(p => p.type === type);
}

/**
 * 根据ID获取专利
 */
function getPatentById(id) {
    return globalData.patents.find(p => p.id === id);
}

/**
 * 根据ID获取学生
 */
function getStudentById(id) {
    return globalData.students.find(s => s.id === id);
}

/**
 * 根据状态获取学生列表
 */
function getStudentsByStatus(status) {
    if (!status || status === 'all') return globalData.students;
    return globalData.students.filter(s => s.status === status);
}

/**
 * 渲染论文列表
 */
function renderPapers(paperIds = null) {
    const papers = paperIds
        ? paperIds.map(id => getPaperById(id)).filter(p => p)
        : globalData.papers;

    return papers.map(paper => `
        <div class="paper-item" data-id="${paper.id}">
            <h4>${paper.title}</h4>
            <p class="meta">
                <strong>作者：</strong>${paper.authors}<br>
                <strong>发表于：</strong>${paper.venue}, ${paper.year}<br>
                <strong>级别：</strong>${paper.level}
            </p>
            ${paper.abstract ? `<p class="abstract">${paper.abstract}</p>` : ''}
            ${paper.doi ? `<p><strong>DOI：</strong>${paper.doi}</p>` : ''}
            ${paper.pdf ? `
                <p class="actions">
                    <a href="${paper.pdf}" class="btn btn-primary" download>
                        📄 下载PDF
                    </a>
                </p>
            ` : ''}
        </div>
    `).join('');
}

/**
 * 渲染专利列表
 */
function renderPatents(patentIds = null) {
    const patents = patentIds
        ? patentIds.map(id => getPatentById(id)).filter(p => p)
        : globalData.patents;

    return patents.map(patent => `
        <div class="patent-item" data-id="${patent.id}">
            <h4>${patent.title}</h4>
            <p class="meta">
                <strong>发明人：</strong>${patent.inventors}<br>
                <strong>专利号：</strong>${patent.number}<br>
                <strong>状态：</strong>${patent.status} | ${patent.date}
            </p>
            ${patent.certificate ? `
                <p class="actions">
                    <a href="${patent.certificate}" class="btn btn-primary" download>
                        🏅 查看证书
                    </a>
                </p>
            ` : ''}
        </div>
    `).join('');
}

/**
 * 渲染学生列表
 */
function renderStudents(studentIds = null) {
    const students = studentIds
        ? studentIds.map(id => getStudentById(id)).filter(s => s)
        : globalData.students;

    return students.map(student => `
        <div class="student-card" data-id="${student.id}">
            ${student.photo ? `
                <div class="student-photo">
                    <img src="${student.photo}" alt="${student.name}">
                </div>
            ` : ''}
            <div class="student-info">
                <h4>${student.name}</h4>
                <p class="meta">
                    ${student.level} | ${student.year} | ${student.status}<br>
                    研究方向：${student.research}
                </p>
                ${student.achievements && student.achievements.length > 0 ? `
                    <p><strong>主要成果：</strong></p>
                    <ul class="achievement-list">
                        ${student.achievements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                ` : ''}
                ${student.status === '已毕业' && student.graduation ? `
                    <p class="graduation-info">
                        <strong>毕业论文：</strong>${student.graduation.thesis}<br>
                        <strong>毕业去向：</strong>${student.graduation.destination}
                    </p>
                ` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * 更新统计数据（显示在侧边栏）
 */
function updateStats() {
    document.getElementById('total-papers').textContent = globalData.papers.length;
    document.getElementById('total-patents').textContent = globalData.patents.length;
    document.getElementById('total-students').textContent = globalData.students.length;
}

// ==================== 全局时间线系统 ====================

/**
 * 添加时间线事件
 * @param {Object} event - 事件对象
 * @param {string} event.date - 日期 (YYYY-MM-DD 或 YYYY-MM 或 YYYY)
 * @param {string} event.title - 事件标题
 * @param {string} event.category - 事件类别 (paper/patent/honor/student/competition/project/other)
 * @param {string} event.description - 事件描述（可选）
 * @param {string} event.relatedId - 关联数据ID（可选）
 */
function addTimelineEvent(event) {
    const timelineEvent = {
        date: event.date,
        title: event.title,
        category: event.category || 'other',
        description: event.description || '',
        relatedId: event.relatedId || null,
        timestamp: new Date(event.date).getTime() // 用于排序
    };

    globalData.timeline.push(timelineEvent);

    // 按时间倒序排序
    globalData.timeline.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 在页面中添加时间线标记（在页面HTML中调用）
 * 示例: <script>markTimelineEvent('2023-06-15', '获得某某奖项', 'honor', 'honor-001');</script>
 */
window.markTimelineEvent = function(date, title, category, relatedId, description) {
    addTimelineEvent({ date, title, category, relatedId, description });
};

/**
 * 获取所有时间线事件
 */
function getAllTimelineEvents() {
    return globalData.timeline;
}

/**
 * 生成时间线Markdown
 */
function generateTimelineMarkdown() {
    if (globalData.timeline.length === 0) {
        return '# 学术时间线\n\n暂无时间线事件。请在页面中使用 `markTimelineEvent()` 添加事件。\n';
    }

    let markdown = '# 学术时间线\n\n';
    markdown += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    markdown += `**共 ${globalData.timeline.length} 个事件**\n\n`;
    markdown += '---\n\n';

    const categoryIcons = {
        paper: '📄',
        patent: '🔬',
        honor: '🏆',
        student: '👨‍🎓',
        competition: '🎯',
        project: '💼',
        other: '📌'
    };

    const categoryNames = {
        paper: '论文发表',
        patent: '专利授权',
        honor: '荣誉奖项',
        student: '学生指导',
        competition: '竞赛指导',
        project: '科研项目',
        other: '其他事件'
    };

    globalData.timeline.forEach(event => {
        const icon = categoryIcons[event.category] || '📌';
        const categoryName = categoryNames[event.category] || '其他';

        markdown += `## ${icon} ${event.date}\n\n`;
        markdown += `**[${categoryName}] ${event.title}**\n\n`;

        if (event.description) {
            markdown += `${event.description}\n\n`;
        }

        if (event.relatedId) {
            markdown += `*关联ID: ${event.relatedId}*\n\n`;
        }

        markdown += '---\n\n';
    });

    return markdown;
}

/**
 * 下载时间线Markdown文件
 */
function downloadTimeline() {
    const markdown = generateTimelineMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `学术时间线_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ 时间线已生成并下载！');
}

// ==================== 学术简历生成 ====================

/**
 * 生成学术简历Markdown
 */
function generateAcademicCV() {
    const info = globalData.personalInfo;
    let cv = '';

    // 标题和基本信息
    cv += `# ${info.name} 的学术简历\n\n`;
    cv += `**${info.title}** | ${info.affiliation}\n\n`;
    cv += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    cv += '---\n\n';

    // 个人信息
    cv += '## 📋 个人信息\n\n';
    cv += `- **姓名**: ${info.name} (${info.nameEn})\n`;
    cv += `- **职称**: ${info.title}\n`;
    cv += `- **单位**: ${info.affiliation} ${info.department}\n`;
    cv += `- **邮箱**: ${info.email}\n`;
    cv += `- **电话**: ${info.phone}\n`;
    cv += `- **地址**: ${info.address} (${info.postcode})\n`;
    cv += `- **研究兴趣**: ${info.researchInterests.join(', ')}\n\n`;

    // 教育背景
    cv += '## 🎓 教育背景\n\n';
    globalData.education.forEach(edu => {
        cv += `### ${edu.degree} - ${edu.major}\n`;
        cv += `**${edu.university}** | ${edu.duration}\n\n`;
        if (edu.thesis) {
            cv += `- 论文: ${edu.thesis}\n`;
        }
        if (edu.supervisor) {
            cv += `- 导师: ${edu.supervisor}\n`;
        }
        cv += '\n';
    });

    // 工作经历
    cv += '## 💼 工作经历\n\n';
    globalData.workExperience.forEach(work => {
        cv += `### ${work.position}\n`;
        cv += `**${work.institution}** - ${work.department} | ${work.duration}\n\n`;
        if (work.description) {
            cv += `${work.description}\n\n`;
        }
    });

    // 科研项目
    cv += '## 💡 科研项目\n\n';
    globalData.projects.forEach((proj, index) => {
        cv += `${index + 1}. **${proj.title}**\n`;
        cv += `   - 项目类型: ${proj.type}\n`;
        cv += `   - 项目编号: ${proj.number}\n`;
        cv += `   - 研究期限: ${proj.duration}\n`;
        cv += `   - 项目角色: ${proj.role}\n`;
        cv += `   - 项目预算: ${proj.budget}\n`;
        cv += `   - 项目状态: ${proj.status}\n\n`;
    });

    // 论文发表
    cv += '## 📚 论文发表\n\n';
    cv += `**共发表论文 ${globalData.papers.length} 篇**\n\n`;

    const journals = globalData.papers.filter(p => p.type === 'journal');
    const conferences = globalData.papers.filter(p => p.type === 'conference');

    if (journals.length > 0) {
        cv += `### 期刊论文 (${journals.length}篇)\n\n`;
        journals.forEach((paper, index) => {
            cv += `${index + 1}. ${paper.authors}. **${paper.title}**. *${paper.venue}*, ${paper.year}. ${paper.level}.\n`;
            if (paper.doi) {
                cv += `   DOI: ${paper.doi}\n`;
            }
            cv += '\n';
        });
    }

    if (conferences.length > 0) {
        cv += `### 会议论文 (${conferences.length}篇)\n\n`;
        conferences.forEach((paper, index) => {
            cv += `${index + 1}. ${paper.authors}. **${paper.title}**. *${paper.venue}*, ${paper.year}. ${paper.level}.\n\n`;
        });
    }

    // 专利
    cv += '## 🔬 专利\n\n';
    cv += `**共授权专利 ${globalData.patents.length} 项**\n\n`;
    globalData.patents.forEach((patent, index) => {
        cv += `${index + 1}. ${patent.inventors}. **${patent.title}**. 专利号: ${patent.number}. ${patent.status}, ${patent.date}.\n\n`;
    });

    // 荣誉奖项
    cv += '## 🏆 荣誉奖项\n\n';
    globalData.honors.forEach((honor, index) => {
        cv += `${index + 1}. **${honor.title}** (${honor.level}) - ${honor.year}年, ${honor.rank}\n\n`;
    });

    // 学生指导
    cv += '## 👨‍🎓 学生指导\n\n';
    const currentStudents = globalData.students.filter(s => s.status === '在读');
    const graduatedStudents = globalData.students.filter(s => s.status === '已毕业');

    cv += `**在读学生**: ${currentStudents.length}人\n\n`;
    currentStudents.forEach((student, index) => {
        cv += `${index + 1}. ${student.name} (${student.level}, ${student.year}) - 研究方向: ${student.research}\n`;
        if (student.achievements && student.achievements.length > 0) {
            cv += `   主要成果: ${student.achievements.join('; ')}\n`;
        }
        cv += '\n';
    });

    cv += `\n**已毕业学生**: ${graduatedStudents.length}人\n\n`;
    graduatedStudents.forEach((student, index) => {
        cv += `${index + 1}. ${student.name} (${student.level}, ${student.year})\n`;
        if (student.graduation) {
            cv += `   毕业论文: ${student.graduation.thesis}\n`;
            cv += `   毕业去向: ${student.graduation.destination}\n`;
        }
        cv += '\n';
    });

    // 竞赛指导
    cv += '## 🎯 竞赛指导\n\n';
    cv += `**指导学生获奖 ${globalData.competitions.length} 项**\n\n`;
    globalData.competitions.forEach((comp, index) => {
        cv += `${index + 1}. **${comp.name}** - ${comp.award} (${comp.date})\n`;
        cv += `   项目: ${comp.project}\n`;
        cv += `   学生: ${comp.students.join(', ')}\n\n`;
    });

    cv += '---\n\n';
    cv += `*简历生成于 ${new Date().toLocaleDateString('zh-CN')}*\n`;

    return cv;
}

/**
 * 下载学术简历Markdown文件
 */
function downloadAcademicCV() {
    const cv = generateAcademicCV();
    const blob = new Blob([cv], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `学术简历_${globalData.personalInfo.name}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ 学术简历已生成并下载！');
}

// ==================== 页面引用示例 ====================
/*
在子页面HTML中使用：

<!-- 显示所有期刊论文 -->
<div id="journals"></div>
<script>
    document.getElementById('journals').innerHTML = renderPapers(
        globalData.papers.filter(p => p.type === 'journal').map(p => p.id)
    );
</script>

<!-- 显示特定论文 -->
<div id="specific-papers"></div>
<script>
    document.getElementById('specific-papers').innerHTML = renderPapers(['paper-001', 'paper-002']);
</script>

<!-- 显示所有在读学生 -->
<div id="current-students"></div>
<script>
    document.getElementById('current-students').innerHTML = renderStudents(
        getStudentsByStatus('在读').map(s => s.id)
    );
</script>

<!-- 添加时间线事件 -->
<script>
    markTimelineEvent('2023-08-15', '指导学生获得全国大学生智能车竞赛一等奖', 'competition', 'competition-001');
    markTimelineEvent('2023-06-15', '专利"一种智能图像识别装置及方法"获得授权', 'patent', 'patent-001');
</script>
*/
