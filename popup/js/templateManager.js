class TemplateManager {
    constructor(storageManager, uiManager, errorHandler) {
        this.storageManager = storageManager;
        this.uiManager = uiManager;
        this.errorHandler = errorHandler;
        this.templates = new Map();
        this.categories = new Set(['quote', 'poetry', 'prose']);
        this.initialized = false;
    }

    async initialize() {
        try {
            // 注册默认模板
            this.registerDefaultTemplates();

            // 加载用户模板
            await this.loadUserTemplates();

            // 初始化模板市场
            await this.initializeMarket();

            // 绑定事件监听
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'templateInitialize');
        }
    }

    // 模板管理
    async addTemplate(template) {
        try {
            if (!this.validateTemplate(template)) {
                throw new Error('Invalid template format');
            }

            // 生成唯一ID
            template.id = template.id || `template_${Date.now()}`;

            // 添加创建时间
            template.createTime = template.createTime || new Date().toISOString();

            // 添加到模板集合
            this.templates.set(template.id, template);

            // 保存到存储
            await this.saveUserTemplates();

            // 更新UI
            this.uiManager.showNotification('模板添加成功', 'success');
            this.updateTemplateList();

            return template.id;
        } catch (error) {
            this.errorHandler.handleError(error, 'addTemplate');
            this.uiManager.showNotification('添加模板失败', 'error');
            throw error;
        }
    }

    async updateTemplate(templateId, updates) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error(`Template ${templateId} not found`);
            }

            // 更新模板
            Object.assign(template, updates);

            // 验证更新后的模板
            if (!this.validateTemplate(template)) {
                throw new Error('Invalid template format after update');
            }

            // 保存更改
            await this.saveUserTemplates();

            // 更新UI
            this.uiManager.showNotification('模板更新成功', 'success');
            this.updateTemplateList();

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'updateTemplate');
            this.uiManager.showNotification('更新模板失败', 'error');
            throw error;
        }
    }

    async deleteTemplate(templateId) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error(`Template ${templateId} not found`);
            }

            // 检查是否为默认模板
            if (template.type === 'default') {
                throw new Error('Cannot delete default template');
            }

            // 删除模板
            this.templates.delete(templateId);

            // 保存更改
            await this.saveUserTemplates();

            // 更新UI
            this.uiManager.showNotification('模板删除成功', 'success');
            this.updateTemplateList();

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'deleteTemplate');
            this.uiManager.showNotification('删除模板失败', 'error');
            throw error;
        }
    }

    // 模板应用
    async applyTemplate(templateId, content) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error(`Template ${templateId} not found`);
            }

            // 应用模板样式
            const styledContent = this.processTemplate(template, content);

            // 触发模板应用事件
            document.dispatchEvent(new CustomEvent('templateApplied', {
                detail: { content: styledContent }
            }));

            return styledContent;
        } catch (error) {
            this.errorHandler.handleError(error, 'applyTemplate');
            this.uiManager.showNotification('应用模板失败', 'error');
            throw error;
        }
    }

    // 模板市场
    async searchTemplates(query = '', filters = {}) {
        try {
            let results = Array.from(this.templates.values());

            // 关键词搜索
            if (query) {
                const keywords = query.toLowerCase().split(/\s+/);
                results = results.filter(template => {
                    const searchText = `${template.name} ${template.description}`.toLowerCase();
                    return keywords.every(keyword => searchText.includes(keyword));
                });
            }

            // 分类筛选
            if (filters.category) {
                results = results.filter(template => template.category === filters.category);
            }

            // 排序
            if (filters.sort) {
                switch (filters.sort) {
                    case 'popular':
                        results.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                        break;
                    case 'newest':
                        results.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
                        break;
                    case 'rating':
                        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                        break;
                }
            }

            return results;
        } catch (error) {
            this.errorHandler.handleError(error, 'searchTemplates');
            throw error;
        }
    }

    // 私有方法
    private registerDefaultTemplates() {
        const defaultTemplates = [
            {
                id: 'default_quote',
                name: '简约金句',
                type: 'default',
                category: 'quote',
                description: '简洁大方的金句样式',
                createTime: new Date().toISOString(),
                style: {
                    fontFamily: 'Microsoft YaHei',
                    fontSize: '24px',
                    color: '#333333',
                    backgroundColor: '#ffffff',
                    padding: '40px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }
            },
            {
                id: 'default_poetry',
                name: '古风诗词',
                type: 'default',
                category: 'poetry',
                description: '古典优雅的诗词样式',
                createTime: new Date().toISOString(),
                style: {
                    fontFamily: 'KaiTi',
                    fontSize: '28px',
                    color: '#1a1a1a',
                    backgroundColor: '#f8f4e9',
                    padding: '50px',
                    borderRadius: '0',
                    boxShadow: 'none',
                    borderLeft: '4px solid #8b4513'
                }
            }
        ];

        defaultTemplates.forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    private async loadUserTemplates() {
        try {
            const userTemplates = await this.storageManager.getData('userTemplates');
            if (userTemplates) {
                Object.entries(userTemplates).forEach(([id, template]) => {
                    if (!this.isDefaultTemplate(id)) {
                        this.templates.set(id, template);
                    }
                });
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'loadUserTemplates');
            throw error;
        }
    }

    private async saveUserTemplates() {
        try {
            const userTemplates = {};
            this.templates.forEach((template, id) => {
                if (!this.isDefaultTemplate(id)) {
                    userTemplates[id] = template;
                }
            });
            await this.storageManager.saveData('userTemplates', userTemplates);
        } catch (error) {
            this.errorHandler.handleError(error, 'saveUserTemplates');
            throw error;
        }
    }

    private validateTemplate(template) {
        return template
            && template.name
            && template.category
            && this.categories.has(template.category)
            && template.style
            && typeof template.style === 'object';
    }

    private processTemplate(template, content) {
        // 创建包装元素
        const wrapper = document.createElement('div');
        wrapper.innerHTML = content;

        // 应用模板样式
        Object.entries(template.style).forEach(([property, value]) => {
            wrapper.style[property] = value;
        });

        return wrapper;
    }

    private updateTemplateList() {
        // 触发模板列表更新事件
        document.dispatchEvent(new CustomEvent('templatesUpdated', {
            detail: { templates: Array.from(this.templates.values()) }
        }));
    }

    private setupEventListeners() {
        // 监听模板上传
        document.getElementById('uploadBtn')?.addEventListener('click', () => {
            this.uiManager.showDialog('uploadDialog', {
                title: '上传模板',
                buttons: [
                    {
                        text: '取消',
                        class: 'secondary',
                        onClick: () => this.uiManager.hideDialog('uploadDialog')
                    },
                    {
                        text: '上传',
                        class: 'primary',
                        onClick: () => this.handleTemplateUpload()
                    }
                ]
            });
        });

        // 监听搜索和筛选
        const searchInput = document.querySelector('.search-input input');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');

        const handleSearch = async () => {
            const query = searchInput?.value || '';
            const filters = {
                category: categorySelect?.value,
                sort: sortSelect?.value
            };

            const results = await this.searchTemplates(query, filters);
            this.renderSearchResults(results);
        };

        searchInput?.addEventListener('input', handleSearch);
        categorySelect?.addEventListener('change', handleSearch);
        sortSelect?.addEventListener('change', handleSearch);
    }

    private async handleTemplateUpload() {
        try {
            const form = document.getElementById('uploadForm');
            if (!form) return;

            const formData = new FormData(form);
            const template = {
                name: formData.get('name'),
                category: formData.get('category'),
                description: formData.get('description'),
                style: JSON.parse(formData.get('style')),
                preview: await this.processPreviewImage(formData.get('preview'))
            };

            await this.addTemplate(template);
            this.uiManager.hideDialog('uploadDialog');
        } catch (error) {
            this.errorHandler.handleError(error, 'handleTemplateUpload');
            this.uiManager.showNotification('上传模板失败', 'error');
        }
    }

    private async processPreviewImage(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No preview image provided'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    private renderSearchResults(results) {
        const grid = document.querySelector('.template-grid');
        if (!grid) return;

        grid.innerHTML = results.map(template => `
            <div class="template-card" data-id="${template.id}">
                <div class="template-preview">
                    <img src="${template.preview || 'images/template-preview.jpg'}" alt="${template.name}">
                    <div class="template-actions">
                        <button class="preview-btn">
                            <i class="icon-eye"></i>
                        </button>
                        <button class="download-btn">
                            <i class="icon-download"></i>
                        </button>
                    </div>
                </div>
                <div class="template-info">
                    <h3 class="template-name">${template.name}</h3>
                    <div class="template-meta">
                        <span class="author">by ${template.author || '匿名'}</span>
                        <div class="stats">
                            <span class="downloads">
                                <i class="icon-download"></i>
                                ${template.downloads || 0}
                            </span>
                            <span class="rating">
                                <i class="icon-star"></i>
                                ${template.rating || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    private isDefaultTemplate(templateId) {
        return templateId.startsWith('default_');
    }
}

export default TemplateManager;
