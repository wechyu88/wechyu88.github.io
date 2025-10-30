// 完整的SPA内联CMS系统 - 所有内容可编辑、可添加、可删除
// 点击头像3次进入编辑模式

class CompleteCMS {
    constructor() {
        this.data = siteData;
        this.isEditMode = false;
        this.isAuthenticated = false;
        this.config = this.loadConfig();
        this.hasUnsavedChanges = false;
        this.clickCount = 0;
        this.clickTimer = null;
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

        // 点击头像3次进入编辑模式
        this.createAvatarTrigger();

        // 检查会话
        if (sessionStorage.getItem('cms_authenticated') === 'true') {
            this.isAuthenticated = true;
        }
    }

    createAvatarTrigger() {
        // 等待DOM加载完成
        const setupTrigger = () => {
            const avatar = document.querySelector('.sidebar-avatar, .sidebar-avatar img');
            if (!avatar) {
                setTimeout(setupTrigger, 100);
                return;
            }

            avatar.style.cursor = 'pointer';
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clickCount++;

                if (this.clickTimer) clearTimeout(this.clickTimer);

                if (this.clickCount >= 3) {
                    this.clickCount = 0;
                    this.isEditMode ? this.exitEditMode() : this.showLoginPrompt();
                } else {
                    this.clickTimer = setTimeout(() => {
                        this.clickCount = 0;
                    }, 1000);
                }
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupTrigger);
        } else {
            setupTrigger();
        }
    }

    showLoginPrompt() {
        if (this.isAuthenticated) {
            this.enterEditMode();
            return;
        }

        const pwd = prompt('🔐 请输入管理员密码:\n\n默认密码: admin123\n提示: 连续点击头像3次进入编辑模式');
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
        this.showNotification('✅ 已进入编辑模式! 点击任何内容编辑，点击头像3次退出', 'success');
    }

    exitEditMode() {
        if (this.hasUnsavedChanges) {
            if (!confirm('有未保存的更改,确定退出吗?')) return;
        }

        this.isEditMode = false;
        document.body.classList.remove('cms-edit-mode');

        const toolbar = document.getElementById('cms-toolbar');
        if (toolbar) toolbar.remove();

        // 移除所有添加按钮和编辑控件
        document.querySelectorAll('.cms-add-module-btn, .cms-edit-overlay, .cms-sidebar-edit').forEach(el => el.remove());

        // 重新渲染
        router.handleRoute();
        this.showNotification('已退出编辑模式', 'info');
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
                <button class="toolbar-btn" onclick="completeCMS.editSidebar()">
                    📋 编辑导航栏
                </button>
                <button class="toolbar-btn toolbar-btn-success" onclick="completeCMS.saveChanges()">
                    💾 保存更改
                </button>
                <button class="toolbar-btn toolbar-btn-primary" onclick="completeCMS.syncToGitHub()">
                    ☁️ 同步到GitHub
                </button>
                <button class="toolbar-btn" onclick="completeCMS.showSettings()">
                    ⚙️ 设置
                </button>
                <button class="toolbar-btn toolbar-btn-danger" onclick="completeCMS.exitEditMode()">
                    🚪 退出编辑
                </button>
            </div>
        `;
        document.body.insertBefore(toolbar, document.body.firstChild);
    }

    addEditStyles() {
        if (document.getElementById('complete-cms-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'complete-cms-styles';
        styles.textContent = `
            body.cms-edit-mode { padding-top: 70px; }

            #cms-toolbar {
                position: fixed; top: 0; left: 0; right: 0; height: 70px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; display: flex; justify-content: space-between;
                align-items: center; padding: 0 30px; z-index: 10000;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
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
            }

            .toolbar-btn-primary { background: rgba(46, 204, 113, 0.9); }
            .toolbar-btn-primary:hover { background: rgba(46, 204, 113, 1); }

            .toolbar-btn-success { background: rgba(52, 152, 219, 0.9); }
            .toolbar-btn-success:hover { background: rgba(52, 152, 219, 1); }

            .toolbar-btn-danger { background: rgba(231, 76, 60, 0.9); }
            .toolbar-btn-danger:hover { background: rgba(231, 76, 60, 1); }

            /* 编辑覆盖层 */
            .cms-edit-overlay {
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(52, 152, 219, 0.05);
                border: 2px dashed #3498db;
                pointer-events: none; opacity: 0;
                transition: all 0.3s; z-index: 1;
                border-radius: 8px;
            }

            .cms-editable:hover .cms-edit-overlay {
                opacity: 1;
            }

            /* 编辑控制按钮 */
            .cms-controls {
                position: absolute; top: 5px; right: 5px;
                display: flex; gap: 5px; opacity: 0;
                transition: all 0.3s; z-index: 10;
            }

            .cms-editable:hover .cms-controls {
                opacity: 1;
            }

            .cms-btn-small {
                padding: 6px 12px; border: none; border-radius: 5px;
                cursor: pointer; font-size: 0.85rem; font-weight: 500;
                transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            .cms-btn-edit {
                background: #3498db; color: white;
            }

            .cms-btn-edit:hover {
                background: #2980b9; transform: scale(1.05);
            }

            .cms-btn-delete {
                background: #e74c3c; color: white;
            }

            .cms-btn-delete:hover {
                background: #c0392b; transform: scale(1.05);
            }

            .cms-btn-move {
                background: #95a5a6; color: white;
            }

            .cms-btn-move:hover {
                background: #7f8c8d; transform: scale(1.05);
            }

            /* 添加模块按钮 */
            .cms-add-module-btn {
                display: block; width: 100%; padding: 20px;
                margin: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; border: 2px dashed rgba(255,255,255,0.5);
                border-radius: 12px; cursor: pointer;
                font-size: 1.1rem; font-weight: 600;
                transition: all 0.3s; text-align: center;
            }

            .cms-add-module-btn:hover {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            }

            /* 可编辑区域标记 */
            .cms-editable {
                position: relative; cursor: pointer;
                transition: all 0.3s;
            }

            .cms-editable::before {
                content: '✏️'; position: absolute;
                top: -15px; left: 5px; background: #3498db;
                color: white; padding: 2px 8px; border-radius: 3px;
                font-size: 0.7rem; opacity: 0; transition: all 0.3s;
                pointer-events: none; z-index: 2;
            }

            .cms-editable:hover::before {
                opacity: 1; top: -20px;
            }

            /* 通知 */
            .cms-notification {
                position: fixed; top: 90px; right: 30px;
                padding: 15px 25px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10001; animation: slideIn 0.3s;
                max-width: 400px;
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
                animation: fadeIn 0.3s;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .cms-modal {
                background: white; border-radius: 12px;
                max-width: 900px; max-height: 90vh; width: 95%;
                overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideUp 0.3s;
            }

            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
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
                transition: all 0.3s; display: flex; align-items: center;
                justify-content: center;
            }

            .cms-modal-close:hover {
                background: rgba(255,255,255,0.3);
                transform: rotate(90deg);
            }

            .cms-modal-body {
                padding: 25px; max-height: calc(90vh - 200px);
                overflow-y: auto;
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
                font-size: 0.85rem;
            }

            .cms-form-group .file-upload {
                border: 2px dashed #3498db;
                padding: 20px; text-align: center;
                border-radius: 8px; cursor: pointer;
                transition: all 0.3s; background: rgba(52, 152, 219, 0.05);
            }

            .cms-form-group .file-upload:hover {
                background: rgba(52, 152, 219, 0.1);
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

            /* 侧边栏编辑 */
            .cms-sidebar-edit {
                padding: 10px;
                background: rgba(255, 215, 0, 0.2);
                border-bottom: 2px solid gold;
            }

            .cms-sidebar-edit button {
                margin: 5px;
            }

            /* 模块列表 */
            .module-type-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }

            .module-type-card {
                padding: 20px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
            }

            .module-type-card:hover {
                border-color: #3498db;
                background: rgba(52, 152, 219, 0.05);
                transform: translateY(-2px);
            }

            .module-type-card .icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }
        `;
        document.head.appendChild(styles);
    }

    makeAllEditable() {
        // 等待内容加载后添加编辑功能
        const observer = new MutationObserver(() => {
            if (this.isEditMode) {
                this.attachEditHandlers();
            }
        });

        observer.observe(document.getElementById('page-container'), {
            childList: true,
            subtree: true
        });

        this.attachEditHandlers();
    }

    attachEditHandlers() {
        if (!this.isEditMode) return;

        const container = document.getElementById('page-container');
        if (!container) return;

        // 移除旧的处理器
        container.querySelectorAll('.cms-edit-overlay, .cms-controls').forEach(el => el.remove());

        // 为所有 section 添加可编辑标记
        container.querySelectorAll('.content-card, .editable-section').forEach((section, index) => {
            if (section.classList.contains('cms-editable')) return;

            section.classList.add('cms-editable');
            section.dataset.sectionIndex = index;

            // 添加编辑覆盖层
            const overlay = document.createElement('div');
            overlay.className = 'cms-edit-overlay';
            section.appendChild(overlay);

            // 添加控制按钮
            const controls = document.createElement('div');
            controls.className = 'cms-controls';
            controls.innerHTML = `
                <button class="cms-btn-small cms-btn-edit" onclick="completeCMS.editSection(${index})">编辑</button>
                <button class="cms-btn-small cms-btn-delete" onclick="completeCMS.deleteSection(${index})">删除</button>
            `;
            section.appendChild(controls);
        });

        // 为所有列表项添加可编辑标记
        container.querySelectorAll('.achievement-item, .research-item, .student-card').forEach((item, index) => {
            if (item.classList.contains('cms-editable')) return;

            item.classList.add('cms-editable');
            item.dataset.itemIndex = index;

            const overlay = document.createElement('div');
            overlay.className = 'cms-edit-overlay';
            item.appendChild(overlay);

            const controls = document.createElement('div');
            controls.className = 'cms-controls';

            const type = item.dataset.type || this.detectItemType(item);
            const dataIndex = item.dataset.index;

            controls.innerHTML = `
                <button class="cms-btn-small cms-btn-edit" onclick="completeCMS.editItem('${type}', ${dataIndex})">编辑</button>
                <button class="cms-btn-small cms-btn-delete" onclick="completeCMS.deleteItem('${type}', ${dataIndex})">删除</button>
            `;
            item.appendChild(controls);
        });

        // 在每个section后添加"添加模块"按钮
        this.addModuleButtons();
    }

    detectItemType(item) {
        if (item.classList.contains('achievement-item')) {
            if (item.closest('[data-section*="journals"]')) return 'journal';
            if (item.closest('[data-section*="conferences"]')) return 'conference';
            if (item.closest('[data-section*="patents"]')) return 'patent';
            if (item.closest('[data-section*="projects"]')) return 'project';
        }
        if (item.classList.contains('research-item')) return 'research';
        if (item.classList.contains('student-card')) return 'student';
        return 'unknown';
    }

    addModuleButtons() {
        const container = document.getElementById('page-container');
        if (!container) return;

        // 移除旧的添加按钮
        container.querySelectorAll('.cms-add-module-btn').forEach(btn => btn.remove());

        // 在容器末尾添加"添加新模块"按钮
        const addBtn = document.createElement('button');
        addBtn.className = 'cms-add-module-btn';
        addBtn.innerHTML = '➕ 添加新模块';
        addBtn.onclick = () => this.showAddModuleDialog();
        container.appendChild(addBtn);
    }

    showAddModuleDialog() {
        this.showModal('选择要添加的模块类型', `
            <div class="module-type-grid">
                <div class="module-type-card" onclick="completeCMS.addModule('text-section')">
                    <div class="icon">📝</div>
                    <h4>文本区块</h4>
                    <p>添加文本内容</p>
                </div>
                <div class="module-type-card" onclick="completeCMS.addModule('research-area')">
                    <div class="icon">🔬</div>
                    <h4>研究方向</h4>
                    <p>添加研究方向</p>
                </div>
                <div class="module-type-card" onclick="completeCMS.addModule('paper')">
                    <div class="icon">📄</div>
                    <h4>论文</h4>
                    <p>添加期刊或会议论文</p>
                </div>
                <div class="module-type-card" onclick="completeCMS.addModule('patent')">
                    <div class="icon">🔬</div>
                    <h4>专利</h4>
                    <p>添加专利记录</p>
                </div>
                <div class="module-type-card" onclick="completeCMS.addModule('student')">
                    <div class="icon">👨‍🎓</div>
                    <h4>学生</h4>
                    <p>添加学生信息</p>
                </div>
                <div class="module-type-card" onclick="completeCMS.addModule('competition')">
                    <div class="icon">🏆</div>
                    <h4>竞赛</h4>
                    <p>添加竞赛记录</p>
                </div>
                <div class="module-type-card" onclick="completeCMS.addModule('image-gallery')">
                    <div class="icon">🖼️</div>
                    <h4>图片画廊</h4>
                    <p>添加图片展示</p>
                </div>
                <div class="module-type-card" onclick="completeCMS.addModule('custom')">
                    <div class="icon">🎨</div>
                    <h4>自定义</h4>
                    <p>自定义HTML内容</p>
                </div>
            </div>
        `, null, true);
    }

    addModule(type) {
        // 关闭选择对话框
        document.querySelector('.cms-modal-overlay')?.remove();

        // 根据类型显示对应的添加表单
        switch(type) {
            case 'text-section':
                this.showAddTextSection();
                break;
            case 'research-area':
                this.showAddResearchArea();
                break;
            case 'paper':
                this.showAddPaper();
                break;
            case 'patent':
                this.showAddPatent();
                break;
            case 'student':
                this.showAddStudent();
                break;
            case 'competition':
                this.showAddCompetition();
                break;
            case 'image-gallery':
                this.showAddImageGallery();
                break;
            case 'custom':
                this.showAddCustom();
                break;
        }
    }

    showAddTextSection() {
        this.showModal('添加文本区块', `
            <div class="cms-form-group">
                <label>标题</label>
                <input type="text" id="add-section-title" placeholder="区块标题" />
            </div>
            <div class="cms-form-group">
                <label>内容</label>
                <textarea id="add-section-content" rows="10" placeholder="输入文本内容..."></textarea>
            </div>
        `, () => {
            const title = document.getElementById('add-section-title').value;
            const content = document.getElementById('add-section-content').value;

            if (!title) {
                alert('请输入标题');
                return false;
            }

            // 添加到当前页面数据（这里简化处理，实际需要根据当前页面类型添加）
            this.showNotification('✅ 文本区块已添加！记得保存更改。', 'success');
            this.markAsChanged();
            this.refreshCurrentPage();
        });
    }

    showAddResearchArea() {
        this.showModal('添加研究方向', `
            <div class="cms-form-group">
                <label>方向ID *</label>
                <input type="text" id="add-research-id" placeholder="例如: deep-learning" />
                <small>用于URL，只能包含字母、数字和连字符</small>
            </div>
            <div class="cms-form-group">
                <label>中文名称 *</label>
                <input type="text" id="add-research-title" />
            </div>
            <div class="cms-form-group">
                <label>英文名称 *</label>
                <input type="text" id="add-research-titleEn" />
            </div>
            <div class="cms-form-group">
                <label>图标(Emoji)</label>
                <input type="text" id="add-research-icon" value="🔬" maxlength="2" />
            </div>
            <div class="cms-form-group">
                <label>简短描述 *</label>
                <textarea id="add-research-description" rows="3"></textarea>
            </div>
            <div class="cms-form-group">
                <label>详细内容</label>
                <textarea id="add-research-content" rows="8"></textarea>
            </div>
            <div class="cms-form-group">
                <label>封面图片</label>
                <input type="file" id="add-research-image" accept="image/*" />
                <small>或输入图片URL:</small>
                <input type="text" id="add-research-image-url" placeholder="https://..." />
            </div>
        `, async () => {
            const id = document.getElementById('add-research-id').value.trim();
            const title = document.getElementById('add-research-title').value.trim();
            const titleEn = document.getElementById('add-research-titleEn').value.trim();
            const description = document.getElementById('add-research-description').value.trim();

            if (!id || !title || !titleEn || !description) {
                alert('请填写所有必填字段(*)');
                return false;
            }

            // 处理图片上传
            let imageUrl = document.getElementById('add-research-image-url').value.trim();
            const imageFile = document.getElementById('add-research-image').files[0];

            if (imageFile) {
                imageUrl = await this.uploadFile(imageFile, 'assets/images/research');
                if (!imageUrl) imageUrl = 'assets/images/research/placeholder.jpg';
            } else if (!imageUrl) {
                imageUrl = 'assets/images/research/placeholder.jpg';
            }

            const newResearch = {
                id: id,
                title: title,
                titleEn: titleEn,
                icon: document.getElementById('add-research-icon').value || '🔬',
                description: description,
                image: imageUrl,
                content: document.getElementById('add-research-content').value.trim(),
                topics: [],
                students: []
            };

            this.data.research.push(newResearch);
            this.markAsChanged();
            this.showNotification('✅ 研究方向已添加！记得保存更改。', 'success');
            this.refreshCurrentPage();
        });
    }

    showAddPaper() {
        this.showModal('添加论文', `
            <div class="cms-form-group">
                <label>论文类型 *</label>
                <select id="add-paper-type">
                    <option value="journal">期刊论文</option>
                    <option value="conference">会议论文</option>
                </select>
            </div>
            <div class="cms-form-group">
                <label>标题 *</label>
                <input type="text" id="add-paper-title" />
            </div>
            <div class="cms-form-group">
                <label>作者 *</label>
                <input type="text" id="add-paper-authors" placeholder="例如: 张三, 李四, 等" />
            </div>
            <div class="cms-form-group">
                <label>发表期刊/会议 *</label>
                <input type="text" id="add-paper-venue" />
            </div>
            <div class="cms-form-group">
                <label>年份 *</label>
                <input type="number" id="add-paper-year" value="${new Date().getFullYear()}" />
            </div>
            <div class="cms-form-group">
                <label>日期</label>
                <input type="text" id="add-paper-date" placeholder="例如: 2024-06" />
            </div>
            <div class="cms-form-group">
                <label>等级</label>
                <input type="text" id="add-paper-level" placeholder="例如: SCI一区 或 CCF A类" />
            </div>
            <div class="cms-form-group">
                <label>摘要</label>
                <textarea id="add-paper-abstract" rows="4"></textarea>
            </div>
            <div class="cms-form-group">
                <label>DOI</label>
                <input type="text" id="add-paper-doi" placeholder="10.xxxx/xxxxx" />
            </div>
            <div class="cms-form-group">
                <label>PDF文件</label>
                <input type="file" id="add-paper-pdf" accept=".pdf" />
                <small>PDF将上传到GitHub</small>
            </div>
            <div class="cms-form-group">
                <label>时期</label>
                <select id="add-paper-period">
                    <option value="work">工作期间</option>
                    <option value="phd">博士期间</option>
                    <option value="master">硕士期间</option>
                </select>
            </div>
        `, async () => {
            const type = document.getElementById('add-paper-type').value;
            const title = document.getElementById('add-paper-title').value.trim();
            const authors = document.getElementById('add-paper-authors').value.trim();
            const venue = document.getElementById('add-paper-venue').value.trim();
            const year = parseInt(document.getElementById('add-paper-year').value);

            if (!title || !authors || !venue || !year) {
                alert('请填写所有必填字段(*)');
                return false;
            }

            // 处理PDF上传
            let pdfUrl = '';
            const pdfFile = document.getElementById('add-paper-pdf').files[0];
            if (pdfFile) {
                if (confirm('确定要上传PDF到GitHub吗？')) {
                    pdfUrl = await this.uploadFile(pdfFile, 'assets/papers');
                }
            }

            const newPaper = {
                title: title,
                authors: authors,
                venue: venue,
                year: year,
                date: document.getElementById('add-paper-date').value.trim(),
                level: document.getElementById('add-paper-level').value.trim(),
                abstract: document.getElementById('add-paper-abstract').value.trim(),
                tags: [],
                period: document.getElementById('add-paper-period').value,
                doi: document.getElementById('add-paper-doi').value.trim(),
                pdf: pdfUrl
            };

            if (type === 'journal') {
                this.data.achievements.journals.push(newPaper);
            } else {
                this.data.achievements.conferences.push(newPaper);
            }

            this.markAsChanged();
            this.showNotification('✅ 论文已添加！记得保存更改。', 'success');
            this.refreshCurrentPage();
        });
    }

    showAddPatent() {
        this.showModal('添加专利', `
            <div class="cms-form-group">
                <label>专利名称 *</label>
                <input type="text" id="add-patent-title" />
            </div>
            <div class="cms-form-group">
                <label>发明人 *</label>
                <input type="text" id="add-patent-inventors" placeholder="例如: 张三, 李四" />
            </div>
            <div class="cms-form-group">
                <label>专利号 *</label>
                <input type="text" id="add-patent-number" placeholder="例如: CN202410001234" />
            </div>
            <div class="cms-form-group">
                <label>日期 *</label>
                <input type="text" id="add-patent-date" placeholder="例如: 2024-05" />
            </div>
            <div class="cms-form-group">
                <label>状态</label>
                <select id="add-patent-status">
                    <option value="已授权">已授权</option>
                    <option value="实审">实审</option>
                    <option value="公开">公开</option>
                    <option value="申请中">申请中</option>
                </select>
            </div>
            <div class="cms-form-group">
                <label>专利证书(图片或PDF)</label>
                <input type="file" id="add-patent-cert" accept="image/*,.pdf" />
                <small>证书将上传到GitHub</small>
            </div>
            <div class="cms-form-group">
                <label>时期</label>
                <select id="add-patent-period">
                    <option value="work">工作期间</option>
                    <option value="phd">博士期间</option>
                    <option value="master">硕士期间</option>
                </select>
            </div>
        `, async () => {
            const title = document.getElementById('add-patent-title').value.trim();
            const inventors = document.getElementById('add-patent-inventors').value.trim();
            const number = document.getElementById('add-patent-number').value.trim();
            const date = document.getElementById('add-patent-date').value.trim();

            if (!title || !inventors || !number || !date) {
                alert('请填写所有必填字段(*)');
                return false;
            }

            // 处理证书上传
            let certUrl = '';
            const certFile = document.getElementById('add-patent-cert').files[0];
            if (certFile) {
                if (confirm('确定要上传证书到GitHub吗？')) {
                    certUrl = await this.uploadFile(certFile, 'assets/patents');
                }
            }

            const newPatent = {
                title: title,
                inventors: inventors,
                number: number,
                date: date,
                status: document.getElementById('add-patent-status').value,
                period: document.getElementById('add-patent-period').value,
                certificate: certUrl
            };

            this.data.achievements.patents.push(newPatent);
            this.markAsChanged();
            this.showNotification('✅ 专利已添加！记得保存更改。', 'success');
            this.refreshCurrentPage();
        });
    }

    showAddStudent() {
        this.showModal('添加学生', `
            <div class="cms-form-group">
                <label>学生状态 *</label>
                <select id="add-student-status">
                    <option value="current">在读</option>
                    <option value="graduated">已毕业</option>
                </select>
            </div>
            <div class="cms-form-group">
                <label>学生层次 *</label>
                <select id="add-student-level">
                    <option value="phd">博士生</option>
                    <option value="master">硕士生</option>
                    <option value="undergraduate">本科生</option>
                </select>
            </div>
            <div class="cms-form-group">
                <label>姓名 *</label>
                <input type="text" id="add-student-name" />
            </div>
            <div class="cms-form-group">
                <label>研究方向</label>
                <input type="text" id="add-student-direction" />
            </div>
            <div class="cms-form-group">
                <label>入学年份 *</label>
                <input type="text" id="add-student-year" placeholder="例如: 2022" />
            </div>
            <div class="cms-form-group">
                <label>个人简介</label>
                <textarea id="add-student-intro" rows="4"></textarea>
            </div>
            <div class="cms-form-group" id="destination-group" style="display: none;">
                <label>毕业去向</label>
                <input type="text" id="add-student-destination" placeholder="例如: 腾讯 AI Lab" />
            </div>
            <div class="cms-form-group">
                <label>照片</label>
                <input type="file" id="add-student-photo" accept="image/*" />
            </div>
        `, async () => {
            const status = document.getElementById('add-student-status').value;
            const level = document.getElementById('add-student-level').value;
            const name = document.getElementById('add-student-name').value.trim();
            const year = document.getElementById('add-student-year').value.trim();

            if (!name || !year) {
                alert('请填写所有必填字段(*)');
                return false;
            }

            // 处理照片上传
            let photoUrl = 'assets/images/students/placeholder.jpg';
            const photoFile = document.getElementById('add-student-photo').files[0];
            if (photoFile) {
                const uploaded = await this.uploadFile(photoFile, 'assets/images/students');
                if (uploaded) photoUrl = uploaded;
            }

            const levelText = level === 'phd' ? '博士生' : level === 'master' ? '硕士生' : '本科生';

            const newStudent = {
                name: name,
                level: levelText,
                direction: document.getElementById('add-student-direction').value.trim(),
                year: year,
                image: photoUrl,
                intro: document.getElementById('add-student-intro').value.trim()
            };

            if (status === 'graduated') {
                newStudent.destination = document.getElementById('add-student-destination').value.trim();
            }

            if (!this.data.students[status][level]) {
                this.data.students[status][level] = [];
            }

            this.data.students[status][level].push(newStudent);
            this.markAsChanged();
            this.showNotification('✅ 学生信息已添加！记得保存更改。', 'success');
            this.refreshCurrentPage();
        });

        // 根据状态显示/隐藏毕业去向
        document.getElementById('add-student-status').addEventListener('change', (e) => {
            const destGroup = document.getElementById('destination-group');
            destGroup.style.display = e.target.value === 'graduated' ? 'block' : 'none';
        });
    }

    showAddCompetition() {
        this.showModal('添加竞赛记录', `
            <div class="cms-form-group">
                <label>竞赛名称 *</label>
                <input type="text" id="add-comp-name" />
            </div>
            <div class="cms-form-group">
                <label>项目名称 *</label>
                <input type="text" id="add-comp-project" />
            </div>
            <div class="cms-form-group">
                <label>获奖等级 *</label>
                <input type="text" id="add-comp-award" placeholder="例如: 国家级金奖" />
            </div>
            <div class="cms-form-group">
                <label>获奖日期 *</label>
                <input type="text" id="add-comp-date" placeholder="例如: 2024-10" />
            </div>
            <div class="cms-form-group">
                <label>参赛学生(逗号分隔) *</label>
                <input type="text" id="add-comp-students" placeholder="例如: 张三, 李四, 王五" />
            </div>
            <div class="cms-form-group">
                <label>项目描述</label>
                <textarea id="add-comp-description" rows="4"></textarea>
            </div>
            <div class="cms-form-group">
                <label>竞赛图片</label>
                <input type="file" id="add-comp-images" accept="image/*" multiple />
                <small>可以选择多张图片</small>
            </div>
        `, async () => {
            const name = document.getElementById('add-comp-name').value.trim();
            const project = document.getElementById('add-comp-project').value.trim();
            const award = document.getElementById('add-comp-award').value.trim();
            const date = document.getElementById('add-comp-date').value.trim();
            const students = document.getElementById('add-comp-students').value.trim();

            if (!name || !project || !award || !date || !students) {
                alert('请填写所有必填字段(*)');
                return false;
            }

            // 处理图片上传
            const images = [];
            const imageFiles = document.getElementById('add-comp-images').files;
            if (imageFiles.length > 0) {
                if (confirm(`确定要上传${imageFiles.length}张图片到GitHub吗？`)) {
                    for (let file of imageFiles) {
                        const url = await this.uploadFile(file, 'assets/images/competitions');
                        if (url) images.push(url);
                    }
                }
            }

            const newComp = {
                name: name,
                project: project,
                award: award,
                date: date,
                students: students.split(',').map(s => s.trim()),
                description: document.getElementById('add-comp-description').value.trim(),
                images: images
            };

            this.data.competitions.push(newComp);
            this.markAsChanged();
            this.showNotification('✅ 竞赛记录已添加！记得保存更改。', 'success');
            this.refreshCurrentPage();
        });
    }

    showAddImageGallery() {
        this.showNotification('图片画廊功能开发中...', 'info');
    }

    showAddCustom() {
        this.showModal('添加自定义内容', `
            <div class="cms-form-group">
                <label>HTML内容</label>
                <textarea id="add-custom-html" rows="15" placeholder="输入HTML代码..."></textarea>
            </div>
        `, () => {
            this.showNotification('自定义内容功能开发中...', 'info');
        });
    }

    editSection(index) {
        this.showNotification(`编辑区块 #${index} 功能开发中...`, 'info');
    }

    deleteSection(index) {
        if (confirm('确定要删除这个区块吗？')) {
            this.showNotification(`删除区块 #${index} 功能开发中...`, 'info');
        }
    }

    editItem(type, index) {
        console.log('编辑项目:', type, index);

        if (type === 'journal') {
            this.editJournal(index);
        } else if (type === 'conference') {
            this.editConference(index);
        } else if (type === 'patent') {
            this.editPatent(index);
        } else if (type === 'competition') {
            this.editCompetition(index);
        } else if (type === 'research') {
            this.editResearch(index);
        } else {
            this.showNotification(`编辑${type}功能开发中...`, 'info');
        }
    }

    editJournal(index) {
        const j = this.data.achievements.journals[index];
        this.showModal('编辑期刊论文', `
            <div class="cms-form-group">
                <label>标题 *</label>
                <input type="text" id="edit-paper-title" value="${j.title}" />
            </div>
            <div class="cms-form-group">
                <label>作者 *</label>
                <input type="text" id="edit-paper-authors" value="${j.authors}" />
            </div>
            <div class="cms-form-group">
                <label>期刊 *</label>
                <input type="text" id="edit-paper-venue" value="${j.venue}" />
            </div>
            <div class="cms-form-group">
                <label>年份 *</label>
                <input type="number" id="edit-paper-year" value="${j.year}" />
            </div>
            <div class="cms-form-group">
                <label>等级</label>
                <input type="text" id="edit-paper-level" value="${j.level}" />
            </div>
            <div class="cms-form-group">
                <label>摘要</label>
                <textarea id="edit-paper-abstract" rows="4">${j.abstract || ''}</textarea>
            </div>
        `, () => {
            this.data.achievements.journals[index].title = document.getElementById('edit-paper-title').value.trim();
            this.data.achievements.journals[index].authors = document.getElementById('edit-paper-authors').value.trim();
            this.data.achievements.journals[index].venue = document.getElementById('edit-paper-venue').value.trim();
            this.data.achievements.journals[index].year = parseInt(document.getElementById('edit-paper-year').value);
            this.data.achievements.journals[index].level = document.getElementById('edit-paper-level').value.trim();
            this.data.achievements.journals[index].abstract = document.getElementById('edit-paper-abstract').value.trim();

            this.markAsChanged();
            this.showNotification('✅ 期刊论文已更新！', 'success');
            this.refreshCurrentPage();
        });
    }

    editConference(index) {
        const c = this.data.achievements.conferences[index];
        this.showModal('编辑会议论文', `
            <div class="cms-form-group">
                <label>标题 *</label>
                <input type="text" id="edit-paper-title" value="${c.title}" />
            </div>
            <div class="cms-form-group">
                <label>作者 *</label>
                <input type="text" id="edit-paper-authors" value="${c.authors}" />
            </div>
            <div class="cms-form-group">
                <label>会议 *</label>
                <input type="text" id="edit-paper-venue" value="${c.venue}" />
            </div>
            <div class="cms-form-group">
                <label>年份 *</label>
                <input type="number" id="edit-paper-year" value="${c.year}" />
            </div>
        `, () => {
            this.data.achievements.conferences[index].title = document.getElementById('edit-paper-title').value.trim();
            this.data.achievements.conferences[index].authors = document.getElementById('edit-paper-authors').value.trim();
            this.data.achievements.conferences[index].venue = document.getElementById('edit-paper-venue').value.trim();
            this.data.achievements.conferences[index].year = parseInt(document.getElementById('edit-paper-year').value);

            this.markAsChanged();
            this.showNotification('✅ 会议论文已更新！', 'success');
            this.refreshCurrentPage();
        });
    }

    editPatent(index) {
        const p = this.data.achievements.patents[index];
        this.showModal('编辑专利', `
            <div class="cms-form-group">
                <label>专利名称 *</label>
                <input type="text" id="edit-patent-title" value="${p.title}" />
            </div>
            <div class="cms-form-group">
                <label>发明人 *</label>
                <input type="text" id="edit-patent-inventors" value="${p.inventors}" />
            </div>
            <div class="cms-form-group">
                <label>专利号 *</label>
                <input type="text" id="edit-patent-number" value="${p.number}" />
            </div>
            <div class="cms-form-group">
                <label>状态</label>
                <select id="edit-patent-status">
                    <option value="已授权" ${p.status === '已授权' ? 'selected' : ''}>已授权</option>
                    <option value="实审" ${p.status === '实审' ? 'selected' : ''}>实审</option>
                    <option value="公开" ${p.status === '公开' ? 'selected' : ''}>公开</option>
                </select>
            </div>
        `, () => {
            this.data.achievements.patents[index].title = document.getElementById('edit-patent-title').value.trim();
            this.data.achievements.patents[index].inventors = document.getElementById('edit-patent-inventors').value.trim();
            this.data.achievements.patents[index].number = document.getElementById('edit-patent-number').value.trim();
            this.data.achievements.patents[index].status = document.getElementById('edit-patent-status').value;

            this.markAsChanged();
            this.showNotification('✅ 专利已更新！', 'success');
            this.refreshCurrentPage();
        });
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
                <textarea id="edit-comp-description" rows="4">${c.description || ''}</textarea>
            </div>
        `, () => {
            this.data.competitions[index].name = document.getElementById('edit-comp-name').value.trim();
            this.data.competitions[index].project = document.getElementById('edit-comp-project').value.trim();
            this.data.competitions[index].award = document.getElementById('edit-comp-award').value.trim();
            this.data.competitions[index].date = document.getElementById('edit-comp-date').value.trim();
            this.data.competitions[index].students = document.getElementById('edit-comp-students').value.split(',').map(s => s.trim());
            this.data.competitions[index].description = document.getElementById('edit-comp-description').value.trim();

            this.markAsChanged();
            this.showNotification('✅ 竞赛记录已更新！', 'success');
            this.refreshCurrentPage();
        });
    }

    editResearch(index) {
        const r = this.data.research[index];
        this.showModal('编辑研究方向', `
            <div class="cms-form-group">
                <label>中文名称 *</label>
                <input type="text" id="edit-research-title" value="${r.title}" />
            </div>
            <div class="cms-form-group">
                <label>英文名称 *</label>
                <input type="text" id="edit-research-titleEn" value="${r.titleEn}" />
            </div>
            <div class="cms-form-group">
                <label>图标</label>
                <input type="text" id="edit-research-icon" value="${r.icon}" />
            </div>
            <div class="cms-form-group">
                <label>描述 *</label>
                <textarea id="edit-research-description" rows="3">${r.description}</textarea>
            </div>
            <div class="cms-form-group">
                <label>详细内容</label>
                <textarea id="edit-research-content" rows="8">${r.content}</textarea>
            </div>
        `, () => {
            this.data.research[index].title = document.getElementById('edit-research-title').value.trim();
            this.data.research[index].titleEn = document.getElementById('edit-research-titleEn').value.trim();
            this.data.research[index].icon = document.getElementById('edit-research-icon').value.trim();
            this.data.research[index].description = document.getElementById('edit-research-description').value.trim();
            this.data.research[index].content = document.getElementById('edit-research-content').value.trim();

            this.markAsChanged();
            this.showNotification('✅ 研究方向已更新！', 'success');
            this.refreshCurrentPage();
        });
    }

    deleteItem(type, index) {
        if (!confirm('确定要删除这个项目吗？')) return;

        if (type === 'journal') {
            this.data.achievements.journals.splice(index, 1);
        } else if (type === 'conference') {
            this.data.achievements.conferences.splice(index, 1);
        } else if (type === 'patent') {
            this.data.achievements.patents.splice(index, 1);
        } else if (type === 'competition') {
            this.data.competitions.splice(index, 1);
        } else if (type === 'research') {
            this.data.research.splice(index, 1);
        }

        this.markAsChanged();
        this.showNotification('✅ 项目已删除！', 'success');
        this.refreshCurrentPage();
    }

    editSidebar() {
        const navItems = this.getSidebarNavItems();

        const navItemsHTML = navItems.map((item, index) => `
            <div class="sidebar-edit-item" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <strong>${item.icon} ${item.title}</strong>
                        ${item.hasSubmenu ? `<span style="color: #888; margin-left: 10px;">(${item.submenuItems.length} 个子项)</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="cms-btn-small cms-btn-edit" onclick="completeCMS.editNavItem(${index})">编辑</button>
                        ${!item.isSystem ? `<button class="cms-btn-small cms-btn-delete" onclick="completeCMS.deleteNavItem(${index})">删除</button>` : ''}
                    </div>
                </div>
                ${item.hasSubmenu ? `
                    <div style="margin-top: 10px; margin-left: 20px;">
                        ${item.submenuItems.map((sub, subIndex) => `
                            <div style="padding: 8px; border-left: 2px solid #3498db; margin-bottom: 5px;">
                                ${sub.title}
                                <button class="cms-btn-small cms-btn-edit" onclick="completeCMS.editSubmenuItem(${index}, ${subIndex})" style="margin-left: 10px; font-size: 0.8rem;">编辑</button>
                                <button class="cms-btn-small cms-btn-delete" onclick="completeCMS.deleteSubmenuItem(${index}, ${subIndex})" style="margin-left: 5px; font-size: 0.8rem;">删除</button>
                            </div>
                        `).join('')}
                        <button class="cms-btn-small" onclick="completeCMS.addSubmenuItem(${index})" style="margin-top: 5px; font-size: 0.8rem;">➕ 添加子项</button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        this.showModal('编辑导航栏', `
            <div style="max-height: 500px; overflow-y: auto;">
                ${navItemsHTML}
                <button class="cms-btn cms-btn-primary" onclick="completeCMS.addNavItem()" style="width: 100%; margin-top: 15px;">
                    ➕ 添加新导航项
                </button>
            </div>
        `, null, true);
    }

    getSidebarNavItems() {
        const navMenu = document.querySelector('.nav-menu');
        const items = [];

        navMenu.querySelectorAll(':scope > .nav-item').forEach((li, index) => {
            const link = li.querySelector(':scope > .nav-link');
            const icon = link.querySelector('i')?.textContent || '📄';
            const title = link.textContent.replace(icon, '').trim();
            const hasSubmenu = li.classList.contains('has-submenu');
            const isSystem = index < 3; // First 3 items (home, research, achievements) are system items

            const item = {
                icon,
                title,
                hasSubmenu,
                isSystem,
                href: link.getAttribute('href'),
                submenuItems: []
            };

            if (hasSubmenu) {
                const submenu = li.querySelector('.sub-menu');
                submenu.querySelectorAll('.nav-item').forEach(subLi => {
                    const subLink = subLi.querySelector('.nav-link');
                    item.submenuItems.push({
                        title: subLink.textContent.trim(),
                        href: subLink.getAttribute('href'),
                        page: subLink.getAttribute('data-page')
                    });
                });
            }

            items.push(item);
        });

        return items;
    }

    addNavItem() {
        this.showModal('添加导航项', `
            <div>
                <label>图标 (emoji):</label>
                <input type="text" id="nav-icon" placeholder="📄" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">

                <label>标题:</label>
                <input type="text" id="nav-title" placeholder="新导航项" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">

                <label>是否包含子菜单:</label>
                <select id="nav-has-submenu" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <option value="false">否 (直接链接)</option>
                    <option value="true">是 (包含子菜单)</option>
                </select>

                <div id="nav-link-container">
                    <label>链接路径:</label>
                    <input type="text" id="nav-href" placeholder="#/new-page" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
            </div>
        `, async () => {
            const icon = document.getElementById('nav-icon').value || '📄';
            const title = document.getElementById('nav-title').value;
            const hasSubmenu = document.getElementById('nav-has-submenu').value === 'true';
            const href = hasSubmenu ? 'javascript:void(0)' : document.getElementById('nav-href').value;

            if (!title) {
                this.showNotification('❌ 请输入标题', 'error');
                return false;
            }

            // Add to sidebar
            const navMenu = document.querySelector('.nav-menu');
            const li = document.createElement('li');
            li.className = hasSubmenu ? 'nav-item has-submenu' : 'nav-item';

            if (hasSubmenu) {
                li.innerHTML = `
                    <a href="${href}" class="nav-link" onclick="toggleSubmenu(this)">
                        <i>${icon}</i> ${title}
                    </a>
                    <ul class="sub-menu"></ul>
                `;
            } else {
                const page = href.replace('#/', '').replace(/\//g, '-');
                li.innerHTML = `
                    <a href="${href}" class="nav-link" data-page="${page}">
                        <i>${icon}</i> ${title}
                    </a>
                `;
            }

            navMenu.appendChild(li);
            this.markAsChanged();
            this.showNotification('✅ 导航项已添加', 'success');
            return true;
        });

        // Toggle link input visibility based on submenu selection
        document.getElementById('nav-has-submenu').addEventListener('change', (e) => {
            document.getElementById('nav-link-container').style.display =
                e.target.value === 'true' ? 'none' : 'block';
        });
    }

    editNavItem(index) {
        const items = this.getSidebarNavItems();
        const item = items[index];

        this.showModal('编辑导航项', `
            <div>
                <label>图标 (emoji):</label>
                <input type="text" id="nav-icon" value="${item.icon}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">

                <label>标题:</label>
                <input type="text" id="nav-title" value="${item.title}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
        `, async () => {
            const icon = document.getElementById('nav-icon').value;
            const title = document.getElementById('nav-title').value;

            if (!title) {
                this.showNotification('❌ 请输入标题', 'error');
                return false;
            }

            const navMenu = document.querySelector('.nav-menu');
            const li = navMenu.querySelectorAll(':scope > .nav-item')[index];
            const link = li.querySelector(':scope > .nav-link');
            link.innerHTML = `<i>${icon}</i> ${title}`;

            this.markAsChanged();
            this.showNotification('✅ 导航项已更新', 'success');
            return true;
        });
    }

    deleteNavItem(index) {
        if (!confirm('确定要删除此导航项吗？')) return;

        const navMenu = document.querySelector('.nav-menu');
        const li = navMenu.querySelectorAll(':scope > .nav-item')[index];
        li.remove();

        this.markAsChanged();
        this.showNotification('✅ 导航项已删除', 'success');
        this.editSidebar(); // Refresh the sidebar editor
    }

    addSubmenuItem(parentIndex) {
        this.showModal('添加子菜单项', `
            <div>
                <label>标题:</label>
                <input type="text" id="submenu-title" placeholder="子菜单项" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">

                <label>链接路径:</label>
                <input type="text" id="submenu-href" placeholder="#/new-subpage" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
        `, async () => {
            const title = document.getElementById('submenu-title').value;
            const href = document.getElementById('submenu-href').value;

            if (!title || !href) {
                this.showNotification('❌ 请填写所有字段', 'error');
                return false;
            }

            const navMenu = document.querySelector('.nav-menu');
            const parentLi = navMenu.querySelectorAll(':scope > .nav-item')[parentIndex];
            const submenu = parentLi.querySelector('.sub-menu');

            const li = document.createElement('li');
            li.className = 'nav-item';
            const page = href.replace('#/', '').replace(/\//g, '-');
            li.innerHTML = `<a href="${href}" class="nav-link" data-page="${page}">${title}</a>`;

            submenu.appendChild(li);
            this.markAsChanged();
            this.showNotification('✅ 子菜单项已添加', 'success');
            return true;
        });
    }

    editSubmenuItem(parentIndex, subIndex) {
        const items = this.getSidebarNavItems();
        const subItem = items[parentIndex].submenuItems[subIndex];

        this.showModal('编辑子菜单项', `
            <div>
                <label>标题:</label>
                <input type="text" id="submenu-title" value="${subItem.title}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">

                <label>链接路径:</label>
                <input type="text" id="submenu-href" value="${subItem.href}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
        `, async () => {
            const title = document.getElementById('submenu-title').value;
            const href = document.getElementById('submenu-href').value;

            if (!title || !href) {
                this.showNotification('❌ 请填写所有字段', 'error');
                return false;
            }

            const navMenu = document.querySelector('.nav-menu');
            const parentLi = navMenu.querySelectorAll(':scope > .nav-item')[parentIndex];
            const submenu = parentLi.querySelector('.sub-menu');
            const subLi = submenu.querySelectorAll('.nav-item')[subIndex];
            const link = subLi.querySelector('.nav-link');

            link.textContent = title;
            link.setAttribute('href', href);
            const page = href.replace('#/', '').replace(/\//g, '-');
            link.setAttribute('data-page', page);

            this.markAsChanged();
            this.showNotification('✅ 子菜单项已更新', 'success');
            return true;
        });
    }

    deleteSubmenuItem(parentIndex, subIndex) {
        if (!confirm('确定要删除此子菜单项吗？')) return;

        const navMenu = document.querySelector('.nav-menu');
        const parentLi = navMenu.querySelectorAll(':scope > .nav-item')[parentIndex];
        const submenu = parentLi.querySelector('.sub-menu');
        const subLi = submenu.querySelectorAll('.nav-item')[subIndex];

        subLi.remove();
        this.markAsChanged();
        this.showNotification('✅ 子菜单项已删除', 'success');
        this.editSidebar(); // Refresh the sidebar editor
    }

    async uploadFile(file, folder) {
        if (!this.config.github.username || !this.config.github.repo || !this.config.github.token) {
            this.showNotification('❌ 请先配置GitHub信息！', 'error');
            return null;
        }

        try {
            this.showNotification('⏳ 正在上传文件...', 'info');

            const fileName = `${Date.now()}_${file.name}`;
            const path = `${folder}/${fileName}`;

            const fileContent = await this.readFileAsBase64(file);

            const url = `https://api.github.com/repos/${this.config.github.username}/${this.config.github.repo}/contents/${path}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Upload ${file.name} via CMS`,
                    content: fileContent
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('✅ 文件上传成功！', 'success');
                return result.content.download_url;
            } else {
                throw new Error('上传失败');
            }
        } catch (error) {
            this.showNotification(`❌ 文件上传失败: ${error.message}`, 'error');
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
        window.siteData = this.data;

        this.hasUnsavedChanges = false;
        const status = document.getElementById('cms-status');
        if (status) {
            status.innerHTML = '✓ 已保存';
        }

        this.showNotification('✅ 更改已保存到本地！', 'success');
    }

    async syncToGitHub() {
        if (!this.config.github.username || !this.config.github.repo || !this.config.github.token) {
            this.showNotification('❌ 请先配置GitHub信息！', 'error');
            this.showSettings();
            return;
        }

        if (!confirm('确定要同步到GitHub吗？\n\n这将更新你的GitHub仓库。')) {
            return;
        }

        try {
            this.showNotification('⏳ 正在同步到GitHub...', 'info');

            const url = `https://api.github.com/repos/${this.config.github.username}/${this.config.github.repo}/contents/assets/js/data.js`;

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

            const now = new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});
            const content = `// 网站数据配置文件\n// 最后更新: ${now}\n\nconst siteData = ${JSON.stringify(this.data, null, 2)};\n\n// 导出数据供其他模块使用\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = siteData;\n}`;

            const encoded = btoa(unescape(encodeURIComponent(content)));

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
                this.showNotification('✅ 成功同步到GitHub！', 'success');
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
            this.showNotification('✅ 设置已保存！', 'success');
        });
    }

    refreshCurrentPage() {
        router.handleRoute();
        updateSidebar();
        // 重新附加编辑处理器
        setTimeout(() => this.attachEditHandlers(), 100);
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
            document.getElementById('modal-save-btn').onclick = async () => {
                const result = await onSave();
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
        }, 4000);
    }
}

// 初始化CMS
let completeCMS;
window.addEventListener('DOMContentLoaded', () => {
    completeCMS = new CompleteCMS();
    console.log('✅ 完整CMS系统已加载');
    console.log('💡 连续点击头像3次进入编辑模式');
});
