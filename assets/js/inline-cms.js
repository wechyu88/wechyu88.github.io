// 内联编辑CMS系统 - 所见即所得
// 直接在页面上编辑，无需弹窗

class InlineCMS {
    constructor() {
        this.data = siteData;
        this.isEditMode = false;
        this.isAuthenticated = false;
        this.config = this.loadConfig();
        this.init();
    }

    // 加载配置
    loadConfig() {
        const defaultConfig = {
            password: 'admin123',
            github: {
                username: '',
                repo: '',
                token: ''
            }
        };

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
        // 监听快捷键 Ctrl+Alt+E (Edit)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'e') {
                e.preventDefault();
                if (this.isEditMode) {
                    this.exitEditMode();
                } else {
                    this.showLoginPrompt();
                }
            }
        });

        // 创建隐藏的登录触发区域
        this.createLoginTrigger();

        // 检查会话
        if (sessionStorage.getItem('cms_authenticated') === 'true') {
            this.isAuthenticated = true;
        }
    }

    createLoginTrigger() {
        // 在页面右下角创建一个小的登录按钮（半透明）
        const trigger = document.createElement('div');
        trigger.id = 'cms-login-trigger';
        trigger.innerHTML = '🔐';
        trigger.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(52, 152, 219, 0.8);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 24px;
            z-index: 9998;
            transition: all 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        trigger.addEventListener('mouseenter', () => {
            trigger.style.background = 'rgba(52, 152, 219, 1)';
            trigger.style.transform = 'scale(1.1)';
        });
        trigger.addEventListener('mouseleave', () => {
            trigger.style.background = 'rgba(52, 152, 219, 0.8)';
            trigger.style.transform = 'scale(1)';
        });
        trigger.addEventListener('click', () => {
            if (this.isEditMode) {
                this.exitEditMode();
            } else {
                this.showLoginPrompt();
            }
        });
        document.body.appendChild(trigger);
    }

    showLoginPrompt() {
        if (this.isAuthenticated) {
            this.enterEditMode();
            return;
        }

        const password = prompt('请输入管理员密码：\n\n• 默认密码：admin123\n• 按Ctrl+Alt+E进入/退出编辑模式');

        if (password === null) return;

        if (password === this.config.password) {
            this.isAuthenticated = true;
            sessionStorage.setItem('cms_authenticated', 'true');
            this.enterEditMode();
        } else {
            alert('❌ 密码错误！');
        }
    }

    enterEditMode() {
        this.isEditMode = true;
        document.body.classList.add('cms-edit-mode');

        // 创建顶部工具栏
        this.createToolbar();

        // 为所有可编辑区域添加编辑功能
        this.makeEditable();

        // 添加样式
        this.addEditModeStyles();

        // 更新登录按钮
        const trigger = document.getElementById('cms-login-trigger');
        if (trigger) {
            trigger.innerHTML = '✏️';
            trigger.style.background = 'rgba(231, 76, 60, 0.8)';
        }

        alert('✅ 已进入编辑模式！\n\n• 鼠标悬停在任何模块上可以看到编辑/删除按钮\n• 点击各区域的[+]按钮添加新内容\n• 完成后点击顶部的"同步到GitHub"按钮保存');
    }

    exitEditMode() {
        if (!confirm('确定要退出编辑模式吗？未保存的更改将丢失。')) {
            return;
        }

        this.isEditMode = false;
        document.body.classList.remove('cms-edit-mode');

        // 移除工具栏
        const toolbar = document.getElementById('cms-toolbar');
        if (toolbar) toolbar.remove();

        // 移除所有编辑按钮
        document.querySelectorAll('.cms-edit-btn, .cms-delete-btn, .cms-add-btn').forEach(btn => btn.remove());

        // 移除所有编辑包装器
        document.querySelectorAll('.cms-editable-wrapper').forEach(wrapper => {
            const parent = wrapper.parentNode;
            while (wrapper.firstChild) {
                parent.insertBefore(wrapper.firstChild, wrapper);
            }
            wrapper.remove();
        });

        // 更新登录按钮
        const trigger = document.getElementById('cms-login-trigger');
        if (trigger) {
            trigger.innerHTML = '🔐';
            trigger.style.background = 'rgba(52, 152, 219, 0.8)';
        }

        // 重新加载页面以恢复原始状态
        location.reload();
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'cms-toolbar';
        toolbar.innerHTML = `
            <div class="cms-toolbar-left">
                <span class="cms-toolbar-title">✏️ 编辑模式</span>
            </div>
            <div class="cms-toolbar-right">
                <button class="cms-toolbar-btn" onclick="inlineCMS.previewMode()">
                    👁️ 预览
                </button>
                <button class="cms-toolbar-btn" onclick="inlineCMS.saveToLocal()">
                    💾 保存到本地
                </button>
                <button class="cms-toolbar-btn cms-toolbar-btn-primary" onclick="inlineCMS.syncToGitHub()">
                    ☁️ 同步到GitHub
                </button>
                <button class="cms-toolbar-btn" onclick="inlineCMS.showSettings()">
                    ⚙️ 设置
                </button>
                <button class="cms-toolbar-btn cms-toolbar-btn-danger" onclick="inlineCMS.exitEditMode()">
                    🚪 退出
                </button>
            </div>
        `;
        document.body.appendChild(toolbar);
    }

    addEditModeStyles() {
        if (document.getElementById('cms-edit-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'cms-edit-styles';
        styles.textContent = `
            /* 编辑模式样式 */
            body.cms-edit-mode {
                padding-top: 60px;
            }

            #cms-toolbar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 20px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .cms-toolbar-title {
                font-size: 1.2rem;
                font-weight: bold;
            }

            .cms-toolbar-right {
                display: flex;
                gap: 10px;
            }

            .cms-toolbar-btn {
                padding: 8px 16px;
                border: none;
                background: rgba(255,255,255,0.2);
                color: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            }

            .cms-toolbar-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }

            .cms-toolbar-btn-primary {
                background: rgba(46, 204, 113, 0.8);
            }

            .cms-toolbar-btn-primary:hover {
                background: rgba(46, 204, 113, 1);
            }

            .cms-toolbar-btn-danger {
                background: rgba(231, 76, 60, 0.8);
            }

            .cms-toolbar-btn-danger:hover {
                background: rgba(231, 76, 60, 1);
            }

            /* 可编辑区域 */
            .cms-editable-wrapper {
                position: relative;
                transition: all 0.3s;
            }

            .cms-editable-wrapper:hover {
                outline: 2px dashed #3498db;
                background: rgba(52, 152, 219, 0.05);
            }

            .cms-editable-wrapper:hover .cms-edit-controls {
                opacity: 1;
                visibility: visible;
            }

            .cms-edit-controls {
                position: absolute;
                top: 5px;
                right: 5px;
                display: flex;
                gap: 5px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s;
                z-index: 100;
            }

            .cms-edit-btn,
            .cms-delete-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            .cms-edit-btn {
                background: #3498db;
                color: white;
            }

            .cms-edit-btn:hover {
                background: #2980b9;
            }

            .cms-delete-btn {
                background: #e74c3c;
                color: white;
            }

            .cms-delete-btn:hover {
                background: #c0392b;
            }

            .cms-add-btn {
                display: inline-block;
                padding: 10px 20px;
                margin: 10px 5px;
                background: #2ecc71;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            }

            .cms-add-btn:hover {
                background: #27ae60;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }

            /* 模态框 */
            .cms-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }

            .cms-modal {
                background: white;
                border-radius: 10px;
                max-width: 800px;
                max-height: 90vh;
                width: 90%;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }

            .cms-modal-header {
                padding: 20px;
                border-bottom: 2px solid #ecf0f1;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .cms-modal-title {
                font-size: 1.5rem;
                font-weight: bold;
                color: #2c3e50;
            }

            .cms-modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: #95a5a6;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            }

            .cms-modal-close:hover {
                background: #ecf0f1;
                color: #2c3e50;
            }

            .cms-modal-body {
                padding: 20px;
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

            .cms-modal-footer {
                padding: 20px;
                border-top: 2px solid #ecf0f1;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            .cms-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s;
            }

            .cms-btn-primary {
                background: #3498db;
                color: white;
            }

            .cms-btn-primary:hover {
                background: #2980b9;
            }

            .cms-btn-secondary {
                background: #95a5a6;
                color: white;
            }

            .cms-btn-secondary:hover {
                background: #7f8c8d;
            }

            /* 添加区域 */
            .cms-add-section {
                padding: 20px;
                margin: 20px 0;
                border: 2px dashed #3498db;
                border-radius: 10px;
                text-align: center;
                background: rgba(52, 152, 219, 0.05);
            }

            .cms-add-section h3 {
                color: #2c3e50;
                margin-bottom: 15px;
            }
        `;
        document.head.appendChild(styles);
    }

    makeEditable() {
        // 1. 个人信息卡片
        this.makePersonalInfoEditable();

        // 2. 研究领域
        this.makeResearchEditable();

        // 3. 研究成果
        this.makeAchievementsEditable();

        // 4. 其他区域...
    }

    makePersonalInfoEditable() {
        const personalSection = document.getElementById('personal-intro');
        if (!personalSection) return;

        this.wrapEditable(personalSection, 'personal-info', () => {
            this.editPersonalInfo();
        });
    }

    makeResearchEditable() {
        // 添加"添加研究方向"按钮
        const researchSection = document.querySelector('.research-grid');
        if (!researchSection) return;

        const addBtn = document.createElement('button');
        addBtn.className = 'cms-add-btn';
        addBtn.textContent = '+ 添加研究方向';
        addBtn.onclick = () => this.addResearch();
        researchSection.parentNode.insertBefore(addBtn, researchSection);

        // 为每个研究项添加编辑/删除按钮
        const researchItems = researchSection.querySelectorAll('.research-item');
        researchItems.forEach((item, index) => {
            this.wrapEditable(item, `research-${index}`, () => {
                this.editResearch(index);
            }, () => {
                this.deleteResearch(index);
            });
        });
    }

    makeAchievementsEditable() {
        // 这里添加成果编辑功能
        // 类似研究方向的处理
    }

    wrapEditable(element, id, onEdit, onDelete) {
        if (element.classList.contains('cms-editable-wrapper')) return;

        element.classList.add('cms-editable-wrapper');

        const controls = document.createElement('div');
        controls.className = 'cms-edit-controls';

        const editBtn = document.createElement('button');
        editBtn.className = 'cms-edit-btn';
        editBtn.textContent = '编辑';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            onEdit();
        };

        controls.appendChild(editBtn);

        if (onDelete) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'cms-delete-btn';
            deleteBtn.textContent = '删除';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('确定要删除吗？')) {
                    onDelete();
                }
            };
            controls.appendChild(deleteBtn);
        }

        element.appendChild(controls);
    }

    // ========== 编辑功能 ==========

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
                <label>简介</label>
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

            this.updateDisplay();
            alert('✅ 个人信息已更新！记得点击"同步到GitHub"保存。');
        });
    }

    addResearch() {
        this.showModal('添加研究方向', `
            <div class="cms-form-group">
                <label>方向ID（英文，用于URL）*</label>
                <input type="text" id="add-research-id" placeholder="例如: deep-learning" />
            </div>
            <div class="cms-form-group">
                <label>中文标题 *</label>
                <input type="text" id="add-research-title" />
            </div>
            <div class="cms-form-group">
                <label>英文标题 *</label>
                <input type="text" id="add-research-titleEn" />
            </div>
            <div class="cms-form-group">
                <label>图标（Emoji）</label>
                <input type="text" id="add-research-icon" value="🔬" />
            </div>
            <div class="cms-form-group">
                <label>简短描述 *</label>
                <textarea id="add-research-description"></textarea>
            </div>
            <div class="cms-form-group">
                <label>详细内容</label>
                <textarea id="add-research-content" style="min-height: 150px;"></textarea>
            </div>
        `, () => {
            const newResearch = {
                id: document.getElementById('add-research-id').value,
                title: document.getElementById('add-research-title').value,
                titleEn: document.getElementById('add-research-titleEn').value,
                icon: document.getElementById('add-research-icon').value,
                description: document.getElementById('add-research-description').value,
                image: 'assets/images/research/placeholder.jpg',
                content: document.getElementById('add-research-content').value,
                topics: [],
                students: []
            };

            if (!newResearch.id || !newResearch.title) {
                alert('❌ 请填写必填字段');
                return false;
            }

            this.data.research.push(newResearch);
            this.updateDisplay();
            alert('✅ 研究方向已添加！记得点击"同步到GitHub"保存。');
            return true;
        });
    }

    editResearch(index) {
        const r = this.data.research[index];
        this.showModal('编辑研究方向', `
            <div class="cms-form-group">
                <label>方向ID（英文，用于URL）*</label>
                <input type="text" id="edit-research-id" value="${r.id}" />
            </div>
            <div class="cms-form-group">
                <label>中文标题 *</label>
                <input type="text" id="edit-research-title" value="${r.title}" />
            </div>
            <div class="cms-form-group">
                <label>英文标题 *</label>
                <input type="text" id="edit-research-titleEn" value="${r.titleEn}" />
            </div>
            <div class="cms-form-group">
                <label>图标（Emoji）</label>
                <input type="text" id="edit-research-icon" value="${r.icon}" />
            </div>
            <div class="cms-form-group">
                <label>简短描述 *</label>
                <textarea id="edit-research-description">${r.description}</textarea>
            </div>
            <div class="cms-form-group">
                <label>详细内容</label>
                <textarea id="edit-research-content" style="min-height: 150px;">${r.content}</textarea>
            </div>
        `, () => {
            this.data.research[index] = {
                ...this.data.research[index],
                id: document.getElementById('edit-research-id').value,
                title: document.getElementById('edit-research-title').value,
                titleEn: document.getElementById('edit-research-titleEn').value,
                icon: document.getElementById('edit-research-icon').value,
                description: document.getElementById('edit-research-description').value,
                content: document.getElementById('edit-research-content').value
            };

            this.updateDisplay();
            alert('✅ 研究方向已更新！记得点击"同步到GitHub"保存。');
        });
    }

    deleteResearch(index) {
        this.data.research.splice(index, 1);
        this.updateDisplay();
        alert('✅ 研究方向已删除！记得点击"同步到GitHub"保存。');
    }

    // ========== 模态框 ==========

    showModal(title, bodyHTML, onSave) {
        const modal = document.createElement('div');
        modal.className = 'cms-modal-overlay';
        modal.innerHTML = `
            <div class="cms-modal">
                <div class="cms-modal-header">
                    <h3 class="cms-modal-title">${title}</h3>
                    <button class="cms-modal-close" onclick="this.closest('.cms-modal-overlay').remove()">×</button>
                </div>
                <div class="cms-modal-body">
                    ${bodyHTML}
                </div>
                <div class="cms-modal-footer">
                    <button class="cms-btn cms-btn-secondary" onclick="this.closest('.cms-modal-overlay').remove()">
                        取消
                    </button>
                    <button class="cms-btn cms-btn-primary" id="modal-save-btn">
                        保存
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 保存按钮事件
        document.getElementById('modal-save-btn').onclick = () => {
            const result = onSave();
            if (result !== false) {
                modal.remove();
            }
        };

        // 点击遮罩关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }

    // ========== 工具栏功能 ==========

    previewMode() {
        // 暂时隐藏所有编辑按钮
        document.querySelectorAll('.cms-edit-controls, .cms-add-btn').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.cms-editable-wrapper').forEach(el => {
            el.style.outline = 'none';
        });

        alert('预览模式\n\n点击"确定"返回编辑模式');

        // 恢复编辑按钮
        document.querySelectorAll('.cms-edit-controls, .cms-add-btn').forEach(el => {
            el.style.display = '';
        });
    }

    saveToLocal() {
        localStorage.setItem('siteData', JSON.stringify(this.data));
        alert('✅ 数据已保存到浏览器本地存储！\n\n注意：这只是临时保存，请使用"同步到GitHub"功能永久保存。');
    }

    async syncToGitHub() {
        if (!this.config.github.username || !this.config.github.repo || !this.config.github.token) {
            alert('❌ 请先配置GitHub信息！\n\n点击"设置"按钮进行配置。');
            this.showSettings();
            return;
        }

        if (!confirm('确定要同步到GitHub吗？\n\n这将更新你的GitHub仓库中的数据文件。')) {
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
            const content = `// 网站数据配置文件\n// 最后更新: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}\n\nconst siteData = ${JSON.stringify(this.data, null, 2)};\n\n// 导出数据供其他模块使用\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = siteData;\n}`;

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
                    message: `Update site data via CMS - ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`,
                    content: encodedContent,
                    sha: sha
                })
            });

            if (updateResponse.ok) {
                alert('✅ 成功同步到GitHub！\n\n更改已推送到你的仓库。稍后刷新页面即可看到更新。');
            } else {
                const error = await updateResponse.json();
                alert(`❌ 同步失败！\n\n${error.message || '未知错误'}\n\n请检查GitHub配置和网络连接。`);
            }
        } catch (error) {
            alert(`❌ 同步失败！\n\n错误: ${error.message}\n\n请检查网络连接和GitHub配置。`);
        }
    }

    showSettings() {
        this.showModal('系统设置', `
            <h4 style="color: #2c3e50; margin-top: 0;">🔒 安全设置</h4>
            <div class="cms-form-group">
                <label>当前密码</label>
                <input type="password" id="settings-current-password" />
            </div>
            <div class="cms-form-group">
                <label>新密码</label>
                <input type="password" id="settings-new-password" />
            </div>
            <div class="cms-form-group">
                <label>确认新密码</label>
                <input type="password" id="settings-confirm-password" />
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 2px solid #ecf0f1;" />

            <h4 style="color: #2c3e50;">🔗 GitHub 集成</h4>
            <p style="color: #666; margin-bottom: 15px;">
                配置GitHub后，可以直接将更改推送到你的仓库。<br>
                <a href="https://github.com/settings/tokens" target="_blank">点击这里</a>创建Personal Access Token（需要repo权限）。
            </p>
            <div class="cms-form-group">
                <label>GitHub 用户名</label>
                <input type="text" id="settings-github-username" value="${this.config.github.username}" />
            </div>
            <div class="cms-form-group">
                <label>仓库名</label>
                <input type="text" id="settings-github-repo" value="${this.config.github.repo}" />
            </div>
            <div class="cms-form-group">
                <label>Personal Access Token</label>
                <input type="password" id="settings-github-token" value="${this.config.github.token}" />
                <small>需要 'repo' 权限</small>
            </div>
        `, () => {
            // 保存密码
            const currentPwd = document.getElementById('settings-current-password').value;
            const newPwd = document.getElementById('settings-new-password').value;
            const confirmPwd = document.getElementById('settings-confirm-password').value;

            if (newPwd && currentPwd !== this.config.password) {
                alert('❌ 当前密码错误');
                return false;
            }

            if (newPwd && newPwd !== confirmPwd) {
                alert('❌ 两次输入的新密码不一致');
                return false;
            }

            if (newPwd && newPwd.length < 6) {
                alert('❌ 密码长度至少6位');
                return false;
            }

            if (newPwd) {
                this.config.password = newPwd;
            }

            // 保存GitHub配置
            this.config.github.username = document.getElementById('settings-github-username').value;
            this.config.github.repo = document.getElementById('settings-github-repo').value;
            this.config.github.token = document.getElementById('settings-github-token').value;

            this.saveConfig();
            alert('✅ 设置已保存！');
        });
    }

    updateDisplay() {
        // 重新加载页面以显示更新后的内容
        location.reload();
    }

    // 文件上传功能（用于论文PDF、专利证书等）
    async uploadFileToGitHub(file, targetPath) {
        if (!this.config.github.username || !this.config.github.repo || !this.config.github.token) {
            alert('❌ 请先在设置中配置GitHub信息');
            return null;
        }

        try {
            const fileContent = await this.readFileAsBase64(file);
            const url = `https://api.github.com/repos/${this.config.github.username}/${this.config.github.repo}/contents/${targetPath}`;

            let sha = null;
            try {
                const getResponse = await fetch(url, {
                    headers: {
                        'Authorization': `token ${this.config.github.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (getResponse.ok) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {}

            const uploadResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload ${file.name} via CMS - ${new Date().toLocaleString()}`,
                    content: fileContent,
                    sha: sha
                })
            });

            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                return result.content.download_url;
            } else {
                throw new Error('上传失败');
            }
        } catch (error) {
            alert(`❌ 文件上传失败: ${error.message}`);
            return null;
        }
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// 初始化内联CMS
let inlineCMS;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        inlineCMS = new InlineCMS();
        console.log('✅ 内联CMS已加载');
        console.log('💡 按Ctrl+Alt+E或点击右下角按钮进入编辑模式');
    });
}
