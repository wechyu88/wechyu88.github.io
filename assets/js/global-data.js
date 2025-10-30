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
    ]
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
*/
