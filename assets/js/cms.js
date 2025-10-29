// 内容管理系统 (CMS) - 安全增强版
// 需要密码验证才能访问

class ContentManagementSystem {
    constructor() {
        this.data = siteData;
        this.isOpen = false;
        this.isAuthenticated = false;
        this.config = this.loadConfig();
        this.clickCount = 0;
        this.clickTimer = null;
        this.init();
    }

    // 加载配置（密码等）
    loadConfig() {
        const defaultConfig = {
            // 默认密码：admin123（请在首次使用后修改）
            password: 'admin123',
            // GitHub配置（可选）
            github: {
                username: '',
                repo: '',
                token: '' // Personal Access Token
            }
        };

        // 尝试从localStorage加载配置
        const savedConfig = localStorage.getItem('cms_config');
        if (savedConfig) {
            try {
                return { ...defaultConfig, ...JSON.parse(savedConfig) };
            } catch (e) {
                return defaultConfig;
            }
        }
        return defaultConfig;
    }

    // 保存配置
    saveConfig() {
        localStorage.setItem('cms_config', JSON.stringify(this.config));
    }

    init() {
        // 监听快捷键 Ctrl+Alt+A (避免与浏览器快捷键冲突)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'a') {
                e.preventDefault();
                this.showPasswordPrompt();
            }
        });

        // 创建隐藏触发方式：连续点击页面标题3次
        this.createSecretTrigger();
    }

    createSecretTrigger() {
        // 找到页面标题或logo元素
        const triggers = document.querySelectorAll('h1, h2.description, .sidebar-header h2');

        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                this.clickCount++;

                // 清除之前的定时器
                if (this.clickTimer) {
                    clearTimeout(this.clickTimer);
                }

                // 如果在1秒内连续点击3次，显示密码提示
                if (this.clickCount >= 3) {
                    this.showPasswordPrompt();
                    this.clickCount = 0;
                } else {
                    // 1秒后重置计数
                    this.clickTimer = setTimeout(() => {
                        this.clickCount = 0;
                    }, 1000);
                }
            });
        });

        // 添加一个更明显的触发区域（但只有管理员知道）
        // 在页面底部创建一个小区域
        const trigger = document.createElement('div');
        trigger.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: transparent;
            cursor: pointer;
            z-index: 9998;
            border-radius: 50%;
        `;
        trigger.title = ''; // 不显示提示
        trigger.addEventListener('dblclick', () => {
            this.showPasswordPrompt();
        });
        document.body.appendChild(trigger);
    }

    // 显示密码输入提示
    showPasswordPrompt() {
        if (this.isAuthenticated) {
            this.togglePanel();
            return;
        }

        const password = prompt('请输入管理员密码：\n\n提示：\n• 默认密码：admin123\n• 首次使用后请在CMS设置中修改密码\n• 按Ctrl+Alt+A或连续点击标题3次打开CMS');

        if (password === null) {
            return; // 用户取消
        }

        if (this.verifyPassword(password)) {
            this.isAuthenticated = true;
            // 保存认证状态（仅在本次会话有效）
            sessionStorage.setItem('cms_authenticated', 'true');
            this.togglePanel();
        } else {
            alert('❌ 密码错误！请重试。\n\n忘记密码？请检查 assets/js/cms.js 文件中的默认密码。');
        }
    }

    // 验证密码
    verifyPassword(inputPassword) {
        return inputPassword === this.config.password;
    }

    // 检查会话认证状态
    checkSessionAuth() {
        return sessionStorage.getItem('cms_authenticated') === 'true';
    }

    togglePanel() {
        if (!this.checkSessionAuth() && !this.isAuthenticated) {
            this.showPasswordPrompt();
            return;
        }

        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        if (document.getElementById('cms-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'cms-panel';
        panel.innerHTML = `
            <div class="cms-overlay"></div>
            <div class="cms-container">
                <div class="cms-header">
                    <h2>🔧 内容管理系统</h2>
                    <div>
                        <button class="cms-btn" onclick="cms.showSettings()" style="margin-right: 10px;">⚙️ 设置</button>
                        <button class="cms-close" onclick="cms.closePanel()">×</button>
                    </div>
                </div>
                <div class="cms-tabs">
                    <button class="cms-tab active" data-tab="personal">个人信息</button>
                    <button class="cms-tab" data-tab="research">研究方向</button>
                    <button class="cms-tab" data-tab="achievements">研究成果</button>
                    <button class="cms-tab" data-tab="teaching">教学工作</button>
                    <button class="cms-tab" data-tab="students">学生指导</button>
                    <button class="cms-tab" data-tab="competitions">竞赛指导</button>
                    <button class="cms-tab" data-tab="export">导出功能</button>
                </div>
                <div class="cms-content">
                    <div id="cms-tab-content"></div>
                </div>
                <div class="cms-footer">
                    <button class="cms-btn cms-btn-primary" onclick="cms.saveData()">💾 保存到本地</button>
                    <button class="cms-btn cms-btn-primary" onclick="cms.saveToGitHub()">☁️ 保存到GitHub</button>
                    <button class="cms-btn" onclick="cms.downloadData()">📥 下载备份</button>
                    <button class="cms-btn" onclick="cms.uploadData()">📤 上传数据</button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.addStyles();
        this.setupTabs();
        this.showTab('personal');
        this.isOpen = true;
    }

    closePanel() {
        const panel = document.getElementById('cms-panel');
        if (panel) {
            panel.remove();
            this.isOpen = false;
        }
    }

    // 显示设置面板
    showSettings() {
        const content = document.getElementById('cms-tab-content');
        content.innerHTML = `
            <h3>⚙️ 系统设置</h3>

            <div class="cms-card">
                <h4>🔒 安全设置</h4>
                <div class="cms-form-group">
                    <label>当前密码</label>
                    <input type="password" id="current-password" placeholder="输入当前密码" />
                </div>
                <div class="cms-form-group">
                    <label>新密码</label>
                    <input type="password" id="new-password" placeholder="输入新密码" />
                </div>
                <div class="cms-form-group">
                    <label>确认新密码</label>
                    <input type="password" id="confirm-password" placeholder="再次输入新密码" />
                </div>
                <button class="cms-btn cms-btn-primary" onclick="cms.changePassword()">修改密码</button>
            </div>

            <div class="cms-card">
                <h4>🔗 GitHub 集成</h4>
                <p style="color: #666; margin-bottom: 15px;">
                    配置GitHub后，可以直接将更改推送到你的仓库。<br>
                    <a href="https://github.com/settings/tokens" target="_blank">点击这里</a>创建Personal Access Token。
                </p>
                <div class="cms-form-group">
                    <label>GitHub 用户名</label>
                    <input type="text" id="github-username" value="${this.config.github.username}" placeholder="例如: wechyu88" />
                </div>
                <div class="cms-form-group">
                    <label>仓库名</label>
                    <input type="text" id="github-repo" value="${this.config.github.repo}" placeholder="例如: wechyu88.github.io" />
                </div>
                <div class="cms-form-group">
                    <label>Personal Access Token</label>
                    <input type="password" id="github-token" value="${this.config.github.token}" placeholder="ghp_xxxxxxxxxxxx" />
                    <small style="color: #999;">需要 'repo' 权限</small>
                </div>
                <button class="cms-btn cms-btn-primary" onclick="cms.saveGitHubConfig()">保存GitHub配置</button>
                <button class="cms-btn" onclick="cms.testGitHubConnection()">测试连接</button>
            </div>

            <div class="cms-card">
                <h4>ℹ️ 使用说明</h4>
                <ul style="line-height: 1.8;">
                    <li><strong>打开CMS：</strong>按 Ctrl+Alt+A 或连续点击页面标题3次</li>
                    <li><strong>保存到本地：</strong>数据保存在浏览器，刷新页面后仍然存在</li>
                    <li><strong>保存到GitHub：</strong>需要配置GitHub信息，将自动提交到仓库</li>
                    <li><strong>下载备份：</strong>导出JSON文件，可以在其他电脑上导入</li>
                    <li><strong>密码保护：</strong>只有输入正确密码才能访问CMS</li>
                </ul>
            </div>

            <div class="cms-card">
                <h4>⚠️ 注意事项</h4>
                <ul style="line-height: 1.8; color: #e74c3c;">
                    <li>请务必记住你的密码，忘记密码需要修改代码文件</li>
                    <li>GitHub Token是敏感信息，请勿泄露给他人</li>
                    <li>建议定期下载数据备份</li>
                    <li>修改密码后，所有设备需要重新登录</li>
                </ul>
            </div>
        `;
    }

    // 修改密码
    changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('❌ 请填写所有字段');
            return;
        }

        if (currentPassword !== this.config.password) {
            alert('❌ 当前密码错误');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('❌ 两次输入的新密码不一致');
            return;
        }

        if (newPassword.length < 6) {
            alert('❌ 密码长度至少6位');
            return;
        }

        this.config.password = newPassword;
        this.saveConfig();
        alert('✅ 密码修改成功！下次登录时请使用新密码。');

        // 清空输入框
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    }

    // 保存GitHub配置
    saveGitHubConfig() {
        this.config.github.username = document.getElementById('github-username').value;
        this.config.github.repo = document.getElementById('github-repo').value;
        this.config.github.token = document.getElementById('github-token').value;

        this.saveConfig();
        alert('✅ GitHub配置已保存');
    }

    // 测试GitHub连接
    async testGitHubConnection() {
        if (!this.config.github.username || !this.config.github.repo || !this.config.github.token) {
            alert('❌ 请先完整填写GitHub配置信息');
            return;
        }

        const url = `https://api.github.com/repos/${this.config.github.username}/${this.config.github.repo}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert(`✅ 连接成功！\n\n仓库: ${data.full_name}\n描述: ${data.description || '无'}`);
            } else {
                alert(`❌ 连接失败！\n\n状态码: ${response.status}\n请检查用户名、仓库名和Token是否正确。`);
            }
        } catch (error) {
            alert(`❌ 连接失败！\n\n错误: ${error.message}`);
        }
    }

    // 保存到GitHub
    async saveToGitHub() {
        if (!this.config.github.username || !this.config.github.repo || !this.config.github.token) {
            alert('❌ 请先在设置中配置GitHub信息');
            this.showSettings();
            return;
        }

        if (!confirm('确定要将更改推送到GitHub吗？\n\n这将更新你的GitHub仓库中的数据文件。')) {
            return;
        }

        try {
            // 获取当前文件的SHA
            const getFileUrl = `https://api.github.com/repos/${this.config.github.username}/${this.config.github.repo}/contents/assets/js/data.js`;

            const getResponse = await fetch(getFileUrl, {
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = null;
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }

            // 准备新的文件内容
            const content = `// 网站数据配置文件\n// 最后更新: ${new Date().toLocaleString()}\n\nconst siteData = ${JSON.stringify(this.data, null, 2)};\n\n// 导出数据供其他模块使用\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = siteData;\n}`;

            const encodedContent = btoa(unescape(encodeURIComponent(content)));

            // 更新文件
            const updateResponse = await fetch(getFileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update site data via CMS - ${new Date().toLocaleString()}`,
                    content: encodedContent,
                    sha: sha
                })
            });

            if (updateResponse.ok) {
                alert('✅ 成功保存到GitHub！\n\n更改已推送到你的仓库。');
            } else {
                const error = await updateResponse.json();
                alert(`❌ 保存失败！\n\n${error.message || '未知错误'}`);
            }
        } catch (error) {
            alert(`❌ 保存失败！\n\n错误: ${error.message}\n\n请检查网络连接和GitHub配置。`);
        }
    }

    addStyles() {
        if (document.getElementById('cms-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'cms-styles';
        styles.textContent = `
            .cms-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 9999;
            }
            .cms-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 1200px;
                height: 80vh;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                display: flex;
                flex-direction: column;
            }
            .cms-header {
                padding: 20px;
                border-bottom: 2px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                border-radius: 10px 10px 0 0;
            }
            .cms-header h2 {
                margin: 0;
                font-size: 1.5rem;
            }
            .cms-close {
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                border-radius: 50%;
                transition: background 0.3s;
            }
            .cms-close:hover {
                background: rgba(255,255,255,0.2);
            }
            .cms-tabs {
                display: flex;
                gap: 5px;
                padding: 10px 20px;
                background: #f5f5f5;
                overflow-x: auto;
            }
            .cms-tab {
                padding: 10px 20px;
                border: none;
                background: white;
                cursor: pointer;
                border-radius: 5px;
                font-size: 0.9rem;
                white-space: nowrap;
                transition: all 0.3s;
            }
            .cms-tab:hover {
                background: #e0e0e0;
            }
            .cms-tab.active {
                background: #3498db;
                color: white;
            }
            .cms-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            .cms-footer {
                padding: 15px 20px;
                border-top: 2px solid #e0e0e0;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                flex-wrap: wrap;
            }
            .cms-btn {
                padding: 10px 20px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
                border-radius: 5px;
                font-size: 1rem;
                transition: all 0.3s;
            }
            .cms-btn:hover {
                background: #f0f0f0;
            }
            .cms-btn-primary {
                background: #3498db;
                color: white;
                border-color: #3498db;
            }
            .cms-btn-primary:hover {
                background: #2980b9;
            }
            .cms-form-group {
                margin-bottom: 20px;
            }
            .cms-form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: #2c3e50;
            }
            .cms-form-group input,
            .cms-form-group textarea,
            .cms-form-group select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 1rem;
                font-family: inherit;
            }
            .cms-form-group textarea {
                min-height: 100px;
                resize: vertical;
            }
            .cms-form-group small {
                display: block;
                margin-top: 5px;
                color: #999;
            }
            .cms-card {
                background: #f9f9f9;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
                border-left: 4px solid #3498db;
            }
            .cms-card h4 {
                margin-top: 0;
                color: #2c3e50;
            }
            .cms-list-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: white;
                margin-bottom: 10px;
                border-radius: 5px;
                border: 1px solid #e0e0e0;
            }
            .cms-list-item:hover {
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(styles);
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.cms-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.showTab(tab.dataset.tab);
            });
        });
    }

    showTab(tabName) {
        const content = document.getElementById('cms-tab-content');

        switch(tabName) {
            case 'personal':
                content.innerHTML = this.renderPersonalForm();
                break;
            case 'research':
                content.innerHTML = this.renderResearchList();
                break;
            case 'achievements':
                content.innerHTML = this.renderAchievementsList();
                break;
            case 'teaching':
                content.innerHTML = this.renderTeachingForm();
                break;
            case 'students':
                content.innerHTML = this.renderStudentsList();
                break;
            case 'competitions':
                content.innerHTML = this.renderCompetitionsList();
                break;
            case 'export':
                content.innerHTML = this.renderExportOptions();
                break;
        }
    }

    renderPersonalForm() {
        const p = this.data.personal;
        return `
            <h3>个人基本信息</h3>
            <div class="cms-form-group">
                <label>中文姓名</label>
                <input type="text" id="name" value="${p.name}" />
            </div>
            <div class="cms-form-group">
                <label>英文姓名</label>
                <input type="text" id="nameEn" value="${p.nameEn}" />
            </div>
            <div class="cms-form-group">
                <label>职称</label>
                <input type="text" id="title" value="${p.title}" />
            </div>
            <div class="cms-form-group">
                <label>单位</label>
                <input type="text" id="affiliation" value="${p.affiliation}" />
            </div>
            <div class="cms-form-group">
                <label>邮箱</label>
                <input type="email" id="email" value="${p.email}" />
            </div>
            <div class="cms-form-group">
                <label>简介</label>
                <textarea id="bio">${p.bio}</textarea>
            </div>
            <div class="cms-form-group">
                <label>详细介绍</label>
                <textarea id="introduction">${p.introduction}</textarea>
            </div>
        `;
    }

    renderResearchList() {
        let html = '<h3>研究方向管理</h3>';
        html += '<button class="cms-btn cms-btn-primary" onclick="cms.addResearch()">+ 添加研究方向</button><br><br>';

        this.data.research.forEach((r, index) => {
            html += `
                <div class="cms-list-item">
                    <div>
                        <strong>${r.icon} ${r.title}</strong>
                        <p style="margin:5px 0 0 0; color:#666;">${r.description}</p>
                    </div>
                    <div>
                        <button class="cms-btn" onclick="cms.editResearch(${index})">编辑</button>
                        <button class="cms-btn" onclick="cms.deleteResearch(${index})">删除</button>
                    </div>
                </div>
            `;
        });

        return html;
    }

    renderAchievementsList() {
        return `
            <h3>研究成果管理</h3>
            <div class="cms-card">
                <h4>📄 期刊论文 (${this.data.achievements.journals.length}篇)</h4>
                <button class="cms-btn" onclick="cms.addAchievement('journal')">+ 添加</button>
            </div>
            <div class="cms-card">
                <h4>📋 会议论文 (${this.data.achievements.conferences.length}篇)</h4>
                <button class="cms-btn" onclick="cms.addAchievement('conference')">+ 添加</button>
            </div>
            <div class="cms-card">
                <h4>🔬 专利 (${this.data.achievements.patents.length}项)</h4>
                <button class="cms-btn" onclick="cms.addAchievement('patent')">+ 添加</button>
            </div>
            <div class="cms-card">
                <h4>📊 科研项目 (${this.data.achievements.projects.length}项)</h4>
                <button class="cms-btn" onclick="cms.addAchievement('project')">+ 添加</button>
            </div>
            <div class="cms-card">
                <h4>🏆 获奖 (${this.data.achievements.awards.length}项)</h4>
                <button class="cms-btn" onclick="cms.addAchievement('award')">+ 添加</button>
            </div>
        `;
    }

    renderTeachingForm() {
        return `
            <h3>教学工作管理</h3>
            <div class="cms-card">
                <h4>📚 授课课程 (${this.data.teaching.courses.length}门)</h4>
                <button class="cms-btn" onclick="cms.addTeaching('course')">+ 添加课程</button>
            </div>
            <div class="cms-card">
                <h4>📖 编写教材 (${this.data.teaching.textbooks.length}本)</h4>
                <button class="cms-btn" onclick="cms.addTeaching('textbook')">+ 添加教材</button>
            </div>
            <div class="cms-card">
                <h4>🏅 教学获奖 (${this.data.teaching.awards.length}项)</h4>
                <button class="cms-btn" onclick="cms.addTeaching('award')">+ 添加获奖</button>
            </div>
        `;
    }

    renderStudentsList() {
        return `
            <h3>学生指导管理</h3>
            <div class="cms-card">
                <h4>在读学生</h4>
                <button class="cms-btn" onclick="cms.addStudent('current', 'phd')">+ 添加博士生</button>
                <button class="cms-btn" onclick="cms.addStudent('current', 'master')">+ 添加硕士生</button>
                <button class="cms-btn" onclick="cms.addStudent('current', 'undergraduate')">+ 添加本科生</button>
            </div>
            <div class="cms-card">
                <h4>已毕业学生</h4>
                <button class="cms-btn" onclick="cms.addStudent('graduated', 'phd')">+ 添加博士生</button>
                <button class="cms-btn" onclick="cms.addStudent('graduated', 'master')">+ 添加硕士生</button>
                <button class="cms-btn" onclick="cms.addStudent('graduated', 'undergraduate')">+ 添加本科生</button>
            </div>
        `;
    }

    renderCompetitionsList() {
        let html = '<h3>竞赛指导管理</h3>';
        html += '<button class="cms-btn cms-btn-primary" onclick="cms.addCompetition()">+ 添加竞赛</button><br><br>';

        this.data.competitions.forEach((c, index) => {
            html += `
                <div class="cms-list-item">
                    <div>
                        <strong>${c.name} - ${c.award}</strong>
                        <p style="margin:5px 0 0 0; color:#666;">${c.date} | 学生: ${c.students.join(', ')}</p>
                    </div>
                    <div>
                        <button class="cms-btn" onclick="cms.editCompetition(${index})">编辑</button>
                        <button class="cms-btn" onclick="cms.deleteCompetition(${index})">删除</button>
                    </div>
                </div>
            `;
        });

        return html;
    }

    renderExportOptions() {
        return `
            <h3>导出功能</h3>

            <div class="cms-card">
                <h3>📅 时间线简历</h3>
                <p>导出按时间顺序排列的个人学术简历，包含所有教育背景、工作经历、研究成果等。</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                    <button class="cms-btn cms-btn-primary" onclick="cms.exportTimelineCV('markdown')">
                        导出为 Markdown
                    </button>
                    <button class="cms-btn cms-btn-primary" onclick="cms.exportTimelineCV('html')">
                        导出为 HTML
                    </button>
                </div>
            </div>

            <div class="cms-card">
                <h3>📋 研究成果列表</h3>
                <p>导出所有研究成果的完整列表，包括论文、专利、项目、获奖等。</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                    <button class="cms-btn cms-btn-primary" onclick="cms.exportAchievementsList('markdown')">
                        导出为 Markdown
                    </button>
                    <button class="cms-btn cms-btn-primary" onclick="cms.exportAchievementsList('html')">
                        导出为 HTML
                    </button>
                    <button class="cms-btn cms-btn-primary" onclick="cms.exportAchievementsList('bibtex')">
                        导出为 BibTeX
                    </button>
                </div>
            </div>

            <div class="cms-card">
                <h3>💾 完整数据备份</h3>
                <p>导出网站所有数据的JSON格式备份文件。</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="cms-btn" onclick="cms.downloadData()">
                        下载数据备份
                    </button>
                </div>
            </div>
        `;
    }

    // 导出时间线简历
    exportTimelineCV(format) {
        let content = '';

        if (format === 'markdown') {
            content = this.generateTimelineCVMarkdown();
            this.downloadFile('academic_cv_timeline.md', content, 'text/markdown');
        } else if (format === 'html') {
            content = this.generateTimelineCVHTML();
            this.downloadFile('academic_cv_timeline.html', content, 'text/html');
        }
    }

    generateTimelineCVMarkdown() {
        const p = this.data.personal;
        let md = `# ${p.name} (${p.nameEn})\n\n`;
        md += `**${p.title}** @ ${p.affiliation}\n\n`;
        md += `📧 ${p.email}\n\n`;
        md += `---\n\n`;

        md += `## 个人简介\n\n${p.bio}\n\n`;
        md += `${p.introduction}\n\n`;

        md += `---\n\n## 时间线\n\n`;

        // 收集所有带时间的事件
        let events = [];

        // 添加成果
        this.data.achievements.journals.forEach(j => {
            events.push({ date: j.date, type: '期刊论文', content: `${j.title}. ${j.venue}, ${j.year}` });
        });
        this.data.achievements.conferences.forEach(c => {
            events.push({ date: c.date, type: '会议论文', content: `${c.title}. ${c.venue}, ${c.year}` });
        });
        this.data.achievements.patents.forEach(p => {
            events.push({ date: p.date, type: '专利', content: `${p.title}. ${p.number}` });
        });
        this.data.achievements.projects.forEach(p => {
            events.push({ date: p.startDate, type: '科研项目', content: `${p.title} (${p.role})` });
        });
        this.data.achievements.awards.forEach(a => {
            events.push({ date: a.date, type: '获奖', content: `${a.title} (${a.organization})` });
        });

        // 按时间倒序排序
        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 生成时间线
        events.forEach(event => {
            md += `### ${event.date}\n**${event.type}**: ${event.content}\n\n`;
        });

        return md;
    }

    generateTimelineCVHTML() {
        const md = this.generateTimelineCVMarkdown();
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.data.personal.name} - 学术简历</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #2c3e50; margin-top: 30px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
        h3 { color: #3498db; margin-top: 20px; }
        hr { border: none; border-top: 1px solid #ecf0f1; margin: 30px 0; }
    </style>
</head>
<body>
${this.markdownToHTML(md)}
</body>
</html>`;
    }

    // 导出成果列表
    exportAchievementsList(format) {
        let content = '';

        if (format === 'markdown') {
            content = this.generateAchievementsListMarkdown();
            this.downloadFile('achievements_list.md', content, 'text/markdown');
        } else if (format === 'html') {
            content = this.generateAchievementsListHTML();
            this.downloadFile('achievements_list.html', content, 'text/html');
        } else if (format === 'bibtex') {
            content = this.generateBibTeX();
            this.downloadFile('publications.bib', content, 'text/plain');
        }
    }

    generateAchievementsListMarkdown() {
        let md = `# ${this.data.personal.name} - 研究成果列表\n\n`;
        md += `更新时间: ${new Date().toLocaleDateString()}\n\n`;
        md += `---\n\n`;

        // 期刊论文
        md += `## 📄 期刊论文 (${this.data.achievements.journals.length}篇)\n\n`;
        this.data.achievements.journals.forEach((j, index) => {
            md += `${index + 1}. **${j.title}**\n`;
            md += `   - 作者: ${j.authors}\n`;
            md += `   - 期刊: ${j.venue}, ${j.year}\n`;
            md += `   - 等级: ${j.level}\n\n`;
        });

        // 会议论文
        md += `## 📋 会议论文 (${this.data.achievements.conferences.length}篇)\n\n`;
        this.data.achievements.conferences.forEach((c, index) => {
            md += `${index + 1}. **${c.title}**\n`;
            md += `   - 作者: ${c.authors}\n`;
            md += `   - 会议: ${c.venue}, ${c.year}\n`;
            md += `   - 等级: ${c.level}\n\n`;
        });

        // 专利
        md += `## 🔬 专利 (${this.data.achievements.patents.length}项)\n\n`;
        this.data.achievements.patents.forEach((p, index) => {
            md += `${index + 1}. **${p.title}**\n`;
            md += `   - 发明人: ${p.inventors}\n`;
            md += `   - 专利号: ${p.number}\n`;
            md += `   - 状态: ${p.status}\n\n`;
        });

        // 科研项目
        md += `## 📊 科研项目 (${this.data.achievements.projects.length}项)\n\n`;
        this.data.achievements.projects.forEach((p, index) => {
            md += `${index + 1}. **${p.title}**\n`;
            md += `   - 项目编号: ${p.number}\n`;
            md += `   - 角色: ${p.role}\n`;
            md += `   - 时间: ${p.startDate} 至 ${p.endDate}\n\n`;
        });

        // 获奖
        md += `## 🏆 获奖情况 (${this.data.achievements.awards.length}项)\n\n`;
        this.data.achievements.awards.forEach((a, index) => {
            md += `${index + 1}. **${a.title}**\n`;
            md += `   - 颁奖单位: ${a.organization}\n`;
            md += `   - 时间: ${a.date}\n`;
            md += `   - 等级: ${a.level}\n\n`;
        });

        return md;
    }

    generateAchievementsListHTML() {
        const md = this.generateAchievementsListMarkdown();
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.data.personal.name} - 研究成果列表</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #2c3e50; margin-top: 30px; background: #ecf0f1; padding: 10px; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
${this.markdownToHTML(md)}
</body>
</html>`;
    }

    generateBibTeX() {
        let bib = '';

        // 期刊论文
        this.data.achievements.journals.forEach((j, index) => {
            const id = `${this.data.personal.nameEn.split(' ').pop()}${j.year}journal${index}`;
            bib += `@article{${id},\n`;
            bib += `  title={${j.title}},\n`;
            bib += `  author={${j.authors}},\n`;
            bib += `  journal={${j.venue}},\n`;
            bib += `  year={${j.year}}\n`;
            bib += `}\n\n`;
        });

        // 会议论文
        this.data.achievements.conferences.forEach((c, index) => {
            const id = `${this.data.personal.nameEn.split(' ').pop()}${c.year}conf${index}`;
            bib += `@inproceedings{${id},\n`;
            bib += `  title={${c.title}},\n`;
            bib += `  author={${c.authors}},\n`;
            bib += `  booktitle={${c.venue}},\n`;
            bib += `  year={${c.year}}\n`;
            bib += `}\n\n`;
        });

        return bib;
    }

    // 简单的Markdown转HTML
    markdownToHTML(md) {
        return md
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/---/g, '<hr>');
    }

    // 保存数据到localStorage
    saveData() {
        try {
            // 更新个人信息
            this.data.personal.name = document.getElementById('name')?.value || this.data.personal.name;
            this.data.personal.nameEn = document.getElementById('nameEn')?.value || this.data.personal.nameEn;
            this.data.personal.title = document.getElementById('title')?.value || this.data.personal.title;
            this.data.personal.affiliation = document.getElementById('affiliation')?.value || this.data.personal.affiliation;
            this.data.personal.email = document.getElementById('email')?.value || this.data.personal.email;
            this.data.personal.bio = document.getElementById('bio')?.value || this.data.personal.bio;
            this.data.personal.introduction = document.getElementById('introduction')?.value || this.data.personal.introduction;

            localStorage.setItem('siteData', JSON.stringify(this.data));
            alert('✅ 数据已保存到浏览器本地存储\n\n注意：这只是临时保存，建议使用"保存到GitHub"功能永久保存。');
        } catch (e) {
            alert('❌ 保存失败: ' + e.message);
        }
    }

    // 下载数据为JSON文件
    downloadData() {
        const json = JSON.stringify(this.data, null, 2);
        this.downloadFile('siteData_backup_' + new Date().toISOString().split('T')[0] + '.json', json, 'application/json');
    }

    // 上传数据
    uploadData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    this.data = JSON.parse(event.target.result);
                    siteData = this.data;
                    alert('✅ 数据已成功导入');
                    this.showTab('personal');
                } catch (err) {
                    alert('❌ 导入失败: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // 下载文件辅助函数
    downloadFile(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 占位函数
    addResearch() { alert('添加研究方向功能待实现'); }
    editResearch(index) { alert('编辑研究方向功能待实现'); }
    deleteResearch(index) {
        if (confirm('确定要删除这个研究方向吗？')) {
            this.data.research.splice(index, 1);
            this.showTab('research');
        }
    }
    addAchievement(type) { alert(`添加${type}功能待实现`); }
    addTeaching(type) { alert(`添加${type}功能待实现`); }
    addStudent(status, level) { alert(`添加学生功能待实现`); }
    addCompetition() { alert('添加竞赛功能待实现'); }
    editCompetition(index) { alert('编辑竞赛功能待实现'); }
    deleteCompetition(index) {
        if (confirm('确定要删除这项竞赛记录吗？')) {
            this.data.competitions.splice(index, 1);
            this.showTab('competitions');
        }
    }
}

// 初始化CMS
let cms;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        cms = new ContentManagementSystem();
        console.log('CMS已加载。按Ctrl+Alt+A打开管理面板。');
    });
}
