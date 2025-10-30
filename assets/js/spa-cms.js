// SPA内联CMS系统
// 所有内容可编辑，保存立即生效，GitHub同步独立

class SPACMS {
    constructor() {
        this.data = siteData;
        this.isEditMode = false;
        this.isAuthenticated = false;
        this.config = this.loadConfig();
        this.hasUnsavedChanges = false;
        this.init();
    }

    loadConfig() {
        const defaultConfig = {
            password: 'admin123',
            github: { username: '', repo: '', token: '' }
        };
        const saved = localStorage.getItem('cms_config');
        return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    }

    saveConfig() {
        localStorage.setItem('cms_config', JSON.stringify(this.config));
    }

    init() {
        // 快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'e') {
                e.preventDefault();
                this.isEditMode ? this.exitEditMode() : this.showLoginPrompt();
            }
        });

        // 登录按钮
        this.createLoginButton();

        // 检查会话
        if (sessionStorage.getItem('cms_authenticated') === 'true') {
            this.isAuthenticated = true;
        }
    }

    createLoginButton() {
        const btn = document.createElement('div');
        btn.id = 'cms-login-btn';
        btn.innerHTML = '🔐';
        btn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            width: 60px; height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 28px; z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });
        btn.addEventListener('click', () => {
            this.isEditMode ? this.exitEditMode() : this.showLoginPrompt();
        });
        document.body.appendChild(btn);
    }

    showLoginPrompt() {
        if (this.isAuthenticated) {
            this.enterEditMode();
            return;
        }

        const pwd = prompt('🔐 请输入管理员密码:\n\n默认密码: admin123\n快捷键: Ctrl+Alt+E');
        if (pwd === null) return;

        if (pwd === this.config.password) {
            this.isAuthenticated = true;
            sessionStorage.setItem('cms_authenticated', 'true');
            this.enterEditMode();
        } else {
            alert('❌ 密码错误!');
        }
    }

    enterEditMode() {
        this.isEditMode = true;
        document.body.classList.add('cms-edit-mode');
        this.createToolbar();
        this.addEditStyles();
        this.makeAllEditable();

        const btn = document.getElementById('cms-login-btn');
        if (btn) {
            btn.innerHTML = '✏️';
            btn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        }

        this.showNotification('✅ 已进入编辑模式!', 'success');
    }

    exitEditMode() {
        if (this.hasUnsavedChanges) {
            if (!confirm('有未保存的更改,确定退出吗?')) return;
        }

        this.isEditMode = false;
        document.body.classList.remove('cms-edit-mode');

        const toolbar = document.getElementById('cms-toolbar');
        if (toolbar) toolbar.remove();

        const btn = document.getElementById('cms-login-btn');
        if (btn) {
            btn.innerHTML = '🔐';
            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }

        // 重新渲染当前页面
        router.handleRoute();
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'cms-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-left">
                <span class="toolbar-logo">✏️ 编辑模式</span>
                <span class="toolbar-status" id="cms-status">
                    ${this.hasUnsavedChanges ? '⚠️ 有未保存的更改' : '✓ 已保存'}
                </span>
            </div>
            <div class="toolbar-right">
                <button class="toolbar-btn" onclick="spaCMS.showHelp()">
                    ❓ 帮助
                </button>
                <button class="toolbar-btn toolbar-btn-success" onclick="spaCMS.saveChanges()">
                    💾 保存更改
                </button>
                <button class="toolbar-btn toolbar-btn-primary" onclick="spaCMS.syncToGitHub()">
                    ☁️ 同步到GitHub
                </button>
                <button class="toolbar-btn" onclick="spaCMS.showSettings()">
                    ⚙️ 设置
                </button>
                <button class="toolbar-btn toolbar-btn-danger" onclick="spaCMS.exitEditMode()">
                    🚪 退出编辑
                </button>
            </div>
        `;
        document.body.insertBefore(toolbar, document.body.firstChild);
    }

    addEditStyles() {
        if (document.getElementById('spa-cms-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'spa-cms-styles';
        styles.textContent = `
            body.cms-edit-mode { padding-top: 70px; }
            body.cms-edit-mode .main-content { margin-left: var(--sidebar-width); }

            #cms-toolbar {
                position: fixed; top: 0; left: 0; right: 0; height: 70px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; display: flex; justify-content: space-between;
                align-items: center; padding: 0 30px; z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }

            .toolbar-logo { font-size: 1.3rem; font-weight: bold; }
            .toolbar-status { margin-left: 20px; font-size: 0.9rem; opacity: 0.9; }
            .toolbar-right { display: flex; gap: 10px; }

            .toolbar-btn {
                padding: 10px 20px; border: none;
                background: rgba(255,255,255,0.2); color: white;
                border-radius: 8px; cursor: pointer; font-size: 0.95rem;
                transition: all 0.3s; font-weight: 500;
            }

            .toolbar-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }

            .toolbar-btn-primary { background: rgba(46, 204, 113, 0.9); }
            .toolbar-btn-primary:hover { background: rgba(46, 204, 113, 1); }

            .toolbar-btn-success { background: rgba(52, 152, 219, 0.9); }
            .toolbar-btn-success:hover { background: rgba(52, 152, 219, 1); }

            .toolbar-btn-danger { background: rgba(231, 76, 60, 0.9); }
            .toolbar-btn-danger:hover { background: rgba(231, 76, 60, 1); }

            /* 可编辑区域 */
            .editable-section, .editable-item {
                position: relative; transition: all 0.3s;
            }

            .editable-section:hover, .editable-item:hover {
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
                background: rgba(52, 152, 219, 0.02);
            }

            .editable-section::before, .editable-item::before {
                content: '✏️ 点击编辑';
                position: absolute; top: -25px; left: 0;
                background: #3498db; color: white; padding: 3px 10px;
                border-radius: 3px; font-size: 0.75rem;
                opacity: 0; transition: all 0.3s; pointer-events: none;
                z-index: 10;
            }

            .editable-section:hover::before, .editable-item:hover::before {
                opacity: 1; top: -30px;
            }

            .edit-controls {
                position: absolute; top: 10px; right: 10px;
                display: flex; gap: 5px; opacity: 0;
                transition: all 0.3s; z-index: 100;
            }

            .editable-section:hover .edit-controls,
            .editable-item:hover .edit-controls {
                opacity: 1;
            }

            .edit-btn, .delete-btn {
                padding: 6px 12px; border: none; border-radius: 5px;
                cursor: pointer; font-size: 0.85rem;
                transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            .edit-btn {
                background: #3498db; color: white;
            }

            .edit-btn:hover {
                background: #2980b9; transform: scale(1.05);
            }

            .delete-btn {
                background: #e74c3c; color: white;
            }

            .delete-btn:hover {
                background: #c0392b; transform: scale(1.05);
            }

            .add-section-btn {
                display: block; width: 100%; padding: 15px;
                margin: 20px 0; background: #2ecc71; color: white;
                border: none; border-radius: 8px; cursor: pointer;
                font-size: 1rem; font-weight: 500;
                transition: all 0.3s;
            }

            .add-section-btn:hover {
                background: #27ae60; transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }

            /* 通知 */
            .cms-notification {
                position: fixed; top: 90px; right: 30px;
                padding: 15px 25px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10001; animation: slideIn 0.3s;
            }

            .cms-notification.success { background: #2ecc71; color: white; }
            .cms-notification.error { background: #e74c3c; color: white; }
            .cms-notification.info { background: #3498db; color: white; }

            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            /* 模态框 */
            .cms-modal-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7); display: flex;
                justify-content: center; align-items: center; z-index: 10002;
            }

            .cms-modal {
                background: white; border-radius: 12px;
                max-width: 800px; max-height: 90vh; width: 90%;
                overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }

            .cms-modal-header {
                padding: 25px; border-bottom: 2px solid #ecf0f1;
                display: flex; justify-content: space-between; align-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; border-radius: 12px 12px 0 0;
            }

            .cms-modal-title {
                font-size: 1.5rem; font-weight: bold; margin: 0;
            }

            .cms-modal-close {
                background: rgba(255,255,255,0.2); border: none;
                color: white; font-size: 1.5rem; cursor: pointer;
                width: 40px; height: 40px; border-radius: 50%;
                transition: all 0.3s;
            }

            .cms-modal-close:hover {
                background: rgba(255,255,255,0.3);
                transform: rotate(90deg);
            }

            .cms-modal-body {
                padding: 25px;
            }

            .cms-form-group {
                margin-bottom: 20px;
            }

            .cms-form-group label {
                display: block; margin-bottom: 8px;
                font-weight: 600; color: #2c3e50; font-size: 0.95rem;
            }

            .cms-form-group input,
            .cms-form-group textarea,
            .cms-form-group select {
                width: 100%; padding: 12px; border: 2px solid #e0e0e0;
                border-radius: 8px; font-size: 1rem; font-family: inherit;
                transition: all 0.3s;
            }

            .cms-form-group input:focus,
            .cms-form-group textarea:focus,
            .cms-form-group select:focus {
                outline: none; border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }

            .cms-form-group textarea {
                min-height: 120px; resize: vertical;
            }

            .cms-form-group small {
                display: block; margin-top: 5px; color: #7f8c8d;
            }

            .cms-modal-footer {
                padding: 20px 25px; border-top: 2px solid #ecf0f1;
                display: flex; justify-content: flex-end; gap: 10px;
                background: #f8f9fa;
            }

            .cms-btn {
                padding: 12px 24px; border: none; border-radius: 8px;
                cursor: pointer; font-size: 1rem; font-weight: 500;
                transition: all 0.3s;
            }

            .cms-btn-primary {
                background: #3498db; color: white;
            }

            .cms-btn-primary:hover {
                background: #2980b9; transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }

            .cms-btn-secondary {
                background: #95a5a6; color: white;
            }

            .cms-btn-secondary:hover {
                background: #7f8c8d;
            }
        `;
        document.head.appendChild(styles);
    }

    makeAllEditable() {
        // 使用MutationObserver监听DOM变化,自动为新内容添加编辑功能
        const observer = new MutationObserver(() => {
            this.attachEditHandlers();
        });

        observer.observe(document.getElementById('page-container'), {
            childList: true,
            subtree: true
        });

        // 初始化现有内容
        this.attachEditHandlers();
    }

    attachEditHandlers() {
        if (!this.isEditMode) return;

        // 为所有可编辑区域添加点击事件
        document.querySelectorAll('.editable-section').forEach(el => {
            if (el.dataset.editable) return; // 已处理
            el.dataset.editable = 'true';
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                if (e.target.closest('.edit-controls')) return;
                this.editSection(el.dataset.section);
            });
        });

        document.querySelectorAll('.editable-item').forEach(el => {
            if (el.dataset.editable) return;
            el.dataset.editable = 'true';
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                if (e.target.closest('.edit-controls, .btn')) return;
                this.editItem(el);
            });
        });
    }

    editSection(sectionName) {
        console.log('编辑区域:', sectionName);
        // 根据section名称决定编辑什么
        if (sectionName === 'personal-intro') {
            this.editPersonalInfo();
        }
        // 可以添加更多section的编辑逻辑
    }

    editItem(element) {
        const type = element.dataset.type;
        const index = parseInt(element.dataset.index);

        console.log('编辑项目:', type, index);

        // 根据类型编辑不同的数据
        if (type === 'journal') {
            this.editJournal(index);
        } else if (type === 'conference') {
            this.editConference(index);
        } else if (type === 'patent') {
            this.editPatent(index);
        } else if (type === 'competition') {
            this.editCompetition(index);
        }
        // 添加更多类型...
    }

    editPersonalInfo() {
        const p = this.data.personal;
        this.showModal('编辑个人信息', `
            <div class="cms-form-group">
                <label>中文姓名 *</label>
                <input type="text" id="edit-name" value="${p.name}" />
            </div>
            <div class="cms-form-group">
                <label>英文姓名 *</label>
                <input type="text" id="edit-nameEn" value="${p.nameEn}" />
            </div>
            <div class="cms-form-group">
                <label>职称 *</label>
                <input type="text" id="edit-title" value="${p.title}" />
            </div>
            <div class="cms-form-group">
                <label>单位 *</label>
                <input type="text" id="edit-affiliation" value="${p.affiliation}" />
            </div>
            <div class="cms-form-group">
                <label>邮箱 *</label>
                <input type="email" id="edit-email" value="${p.email}" />
            </div>
            <div class="cms-form-group">
                <label>个人简介</label>
                <textarea id="edit-bio">${p.bio}</textarea>
            </div>
            <div class="cms-form-group">
                <label>详细介绍</label>
                <textarea id="edit-introduction">${p.introduction}</textarea>
            </div>
        `, () => {
            this.data.personal.name = document.getElementById('edit-name').value;
            this.data.personal.nameEn = document.getElementById('edit-nameEn').value;
            this.data.personal.title = document.getElementById('edit-title').value;
            this.data.personal.affiliation = document.getElementById('edit-affiliation').value;
            this.data.personal.email = document.getElementById('edit-email').value;
            this.data.personal.bio = document.getElementById('edit-bio').value;
            this.data.personal.introduction = document.getElementById('edit-introduction').value;

            this.markAsChanged();
            this.refreshCurrentPage();
            this.showNotification('✅ 个人信息已更新!', 'success');
        });
    }

    editJournal(index) {
        const j = this.data.achievements.journals[index];
        // 这里实现期刊编辑逻辑
        this.showNotification('期刊编辑功能开发中...', 'info');
    }

    editConference(index) {
        this.showNotification('会议编辑功能开发中...', 'info');
    }

    editPatent(index) {
        this.showNotification('专利编辑功能开发中...', 'info');
    }

    editCompetition(index) {
        const c = this.data.competitions[index];
        this.showModal('编辑竞赛记录', `
            <div class="cms-form-group">
                <label>竞赛名称 *</label>
                <input type="text" id="edit-comp-name" value="${c.name}" />
            </div>
            <div class="cms-form-group">
                <label>项目名称 *</label>
                <input type="text" id="edit-comp-project" value="${c.project}" />
            </div>
            <div class="cms-form-group">
                <label>获奖等级 *</label>
                <input type="text" id="edit-comp-award" value="${c.award}" />
            </div>
            <div class="cms-form-group">
                <label>获奖日期 *</label>
                <input type="text" id="edit-comp-date" value="${c.date}" />
            </div>
            <div class="cms-form-group">
                <label>参赛学生(逗号分隔) *</label>
                <input type="text" id="edit-comp-students" value="${c.students.join(', ')}" />
            </div>
            <div class="cms-form-group">
                <label>项目描述</label>
                <textarea id="edit-comp-description">${c.description || ''}</textarea>
            </div>
        `, () => {
            this.data.competitions[index] = {
                ...c,
                name: document.getElementById('edit-comp-name').value,
                project: document.getElementById('edit-comp-project').value,
                award: document.getElementById('edit-comp-award').value,
                date: document.getElementById('edit-comp-date').value,
                students: document.getElementById('edit-comp-students').value.split(',').map(s => s.trim()),
                description: document.getElementById('edit-comp-description').value
            };

            this.markAsChanged();
            this.refreshCurrentPage();
            this.showNotification('✅ 竞赛记录已更新!', 'success');
        });
    }

    markAsChanged() {
        this.hasUnsavedChanges = true;
        const status = document.getElementById('cms-status');
        if (status) {
            status.innerHTML = '⚠️ 有未保存的更改';
        }
    }

    saveChanges() {
        // 保存到localStorage
        localStorage.setItem('siteData', JSON.stringify(this.data));

        // 同时更新全局变量
        window.siteData = this.data;

        this.hasUnsavedChanges = false;
        const status = document.getElementById('cms-status');
        if (status) {
            status.innerHTML = '✓ 已保存';
        }

        this.showNotification('✅ 更改已保存到本地!', 'success');
    }

    async syncToGitHub() {
        if (!this.config.github.username || !this.config.github.repo || !this.config.github.token) {
            this.showNotification('❌ 请先配置GitHub信息!', 'error');
            this.showSettings();
            return;
        }

        if (!confirm('确定要同步到GitHub吗?\n\n这将更新你的GitHub仓库。')) {
            return;
        }

        try {
            this.showNotification('⏳ 正在同步到GitHub...', 'info');

            const url = `https://api.github.com/repos/${this.config.github.username}/${this.config.github.repo}/contents/assets/js/data.js`;

            // 获取文件SHA
            const getResp = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = null;
            if (getResp.ok) {
                const data = await getResp.json();
                sha = data.sha;
            }

            // 准备内容
            const now = new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});
            const content = `// 网站数据配置文件\n// 最后更新: ${now}\n\nconst siteData = ${JSON.stringify(this.data, null, 2)};\n\n// 导出数据供其他模块使用\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = siteData;\n}`;

            const encoded = btoa(unescape(encodeURIComponent(content)));

            // 更新文件
            const updateResp = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Update site data via CMS - ${now}`,
                    content: encoded,
                    sha: sha
                })
            });

            if (updateResp.ok) {
                this.showNotification('✅ 成功同步到GitHub!', 'success');
                this.hasUnsavedChanges = false;
                const status = document.getElementById('cms-status');
                if (status) status.innerHTML = '✓ 已保存';
            } else {
                const error = await updateResp.json();
                throw new Error(error.message || '同步失败');
            }
        } catch (error) {
            this.showNotification(`❌ 同步失败: ${error.message}`, 'error');
        }
    }

    showSettings() {
        this.showModal('系统设置', `
            <h4 style="color: #2c3e50; margin-top: 0;">🔒 安全设置</h4>
            <div class="cms-form-group">
                <label>当前密码</label>
                <input type="password" id="settings-current-pwd" />
            </div>
            <div class="cms-form-group">
                <label>新密码</label>
                <input type="password" id="settings-new-pwd" />
            </div>
            <div class="cms-form-group">
                <label>确认新密码</label>
                <input type="password" id="settings-confirm-pwd" />
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 2px solid #ecf0f1;" />

            <h4 style="color: #2c3e50;">🔗 GitHub 集成</h4>
            <div class="cms-form-group">
                <label>GitHub用户名</label>
                <input type="text" id="settings-gh-user" value="${this.config.github.username}" placeholder="例如: wechyu88" />
            </div>
            <div class="cms-form-group">
                <label>仓库名</label>
                <input type="text" id="settings-gh-repo" value="${this.config.github.repo}" placeholder="例如: wechyu88.github.io" />
            </div>
            <div class="cms-form-group">
                <label>Personal Access Token</label>
                <input type="password" id="settings-gh-token" value="${this.config.github.token}" placeholder="ghp_xxxxxxxxxxxx" />
                <small>需要repo权限. <a href="https://github.com/settings/tokens" target="_blank">创建Token</a></small>
            </div>
        `, () => {
            const currentPwd = document.getElementById('settings-current-pwd').value;
            const newPwd = document.getElementById('settings-new-pwd').value;
            const confirmPwd = document.getElementById('settings-confirm-pwd').value;

            if (newPwd) {
                if (currentPwd !== this.config.password) {
                    alert('❌ 当前密码错误');
                    return false;
                }
                if (newPwd !== confirmPwd) {
                    alert('❌ 两次密码不一致');
                    return false;
                }
                if (newPwd.length < 6) {
                    alert('❌ 密码至少6位');
                    return false;
                }
                this.config.password = newPwd;
            }

            this.config.github.username = document.getElementById('settings-gh-user').value;
            this.config.github.repo = document.getElementById('settings-gh-repo').value;
            this.config.github.token = document.getElementById('settings-gh-token').value;

            this.saveConfig();
            this.showNotification('✅ 设置已保存!', 'success');
        });
    }

    showHelp() {
        this.showModal('使用帮助', `
            <h3>📘 快速入门</h3>
            <ul style="line-height: 2;">
                <li><strong>编辑内容:</strong> 直接点击页面上的任何内容块</li>
                <li><strong>保存更改:</strong> 点击工具栏的"💾 保存更改"</li>
                <li><strong>同步GitHub:</strong> 点击"☁️ 同步到GitHub"上传到服务器</li>
                <li><strong>退出编辑:</strong> 点击"🚪 退出编辑"或按Ctrl+Alt+E</li>
            </ul>

            <h3>⚡ 快捷键</h3>
            <ul style="line-height: 2;">
                <li><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>E</kbd> - 进入/退出编辑模式</li>
            </ul>

            <h3>💡 提示</h3>
            <ul style="line-height: 2;">
                <li>保存更改后,内容立即在页面生效</li>
                <li>同步到GitHub后,全世界都能看到你的更新</li>
                <li>建议先保存到本地,确认无误后再同步GitHub</li>
            </ul>
        `, null, true);
    }

    refreshCurrentPage() {
        // 刷新当前页面,但不重新加载
        router.handleRoute();
        updateSidebar();
    }

    showModal(title, bodyHTML, onSave, helpMode = false) {
        const modal = document.createElement('div');
        modal.className = 'cms-modal-overlay';
        modal.innerHTML = `
            <div class="cms-modal">
                <div class="cms-modal-header">
                    <h3 class="cms-modal-title">${title}</h3>
                    <button class="cms-modal-close" onclick="this.closest('.cms-modal-overlay').remove()">×</button>
                </div>
                <div class="cms-modal-body">${bodyHTML}</div>
                ${!helpMode ? `
                <div class="cms-modal-footer">
                    <button class="cms-btn cms-btn-secondary" onclick="this.closest('.cms-modal-overlay').remove()">
                        取消
                    </button>
                    <button class="cms-btn cms-btn-primary" id="modal-save-btn">
                        保存
                    </button>
                </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);

        if (onSave) {
            document.getElementById('modal-save-btn').onclick = () => {
                const result = onSave();
                if (result !== false) modal.remove();
            };
        }

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `cms-notification ${type}`;
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
}

// 初始化CMS
let spaCMS;
window.addEventListener('DOMContentLoaded', () => {
    spaCMS = new SPACMS();
    console.log('✅ SPA-CMS已加载');
    console.log('💡 按Ctrl+Alt+E进入编辑模式');
});
