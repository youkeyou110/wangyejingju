class EditorManager {
    constructor(storageManager, uiManager, errorHandler) {
        this.storageManager = storageManager;
        this.uiManager = uiManager;
        this.errorHandler = errorHandler;
        this.editor = null;
        this.preview = null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistoryLength = 50;
        this.autoSaveInterval = 30000; // 30秒
        this.initialized = false;
    }

    async initialize() {
        try {
            // 初始化编辑器和预览区域
            this.editor = document.getElementById('editor');
            this.preview = document.getElementById('preview');

            if (!this.editor || !this.preview) {
                throw new Error('Editor or preview element not found');
            }

            // 加载上次编辑内容
            await this.loadContent();

            // 初始化编辑器功能
            this.initializeEditor();

            // 设置自动保存
            this.setupAutoSave();

            // 初始化工具栏
            this.initializeToolbar();

            // 绑定事件监听
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'editorInitialize');
        }
    }

    // 内容管理
    async saveContent() {
        try {
            const content = {
                html: this.editor.innerHTML,
                text: this.editor.textContent,
                timestamp: new Date().toISOString()
            };

            await this.storageManager.saveData('editorContent', content);
            this.uiManager.showNotification('内容已保存', 'success');

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'saveContent');
            this.uiManager.showNotification('保存失败', 'error');
            return false;
        }
    }

    async loadContent() {
        try {
            const content = await this.storageManager.getData('editorContent');
            if (content?.html) {
                this.editor.innerHTML = content.html;
                this.updatePreview();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'loadContent');
        }
    }

    // 历史记录管理
    addToHistory() {
        try {
            // 删除当前位置之后的历史记录
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }

            // 添加新的历史记录
            this.history.push({
                html: this.editor.innerHTML,
                timestamp: new Date().toISOString()
            });

            // 限制历史记录长度
            if (this.history.length > this.maxHistoryLength) {
                this.history.shift();
            } else {
                this.historyIndex++;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'addToHistory');
        }
    }

    undo() {
        try {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                const state = this.history[this.historyIndex];
                this.editor.innerHTML = state.html;
                this.updatePreview();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'undo');
        }
    }

    redo() {
        try {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                const state = this.history[this.historyIndex];
                this.editor.innerHTML = state.html;
                this.updatePreview();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'redo');
        }
    }

    // 工具栏功能
    execCommand(command, value = null) {
        try {
            document.execCommand(command, false, value);
            this.editor.focus();
            this.updatePreview();
            this.addToHistory();
        } catch (error) {
            this.errorHandler.handleError(error, 'execCommand');
        }
    }

    // 预览更新
    updatePreview() {
        try {
            // 克隆编辑器内容到预览区
            const content = this.editor.cloneNode(true);

            // 清理预览区
            while (this.preview.firstChild) {
                this.preview.removeChild(this.preview.firstChild);
            }

            // 应用当前样式
            this.preview.appendChild(content);
        } catch (error) {
            this.errorHandler.handleError(error, 'updatePreview');
        }
    }

    // 私有方法
    private initializeEditor() {
        // 设置编辑器默认样式
        this.editor.style.minHeight = '200px';
        this.editor.style.padding = '1rem';

        // 添加占位符
        if (!this.editor.textContent.trim()) {
            this.editor.innerHTML = '<p>在这里输入内容...</p>';
        }

        // 初始化历史记录
        this.addToHistory();
    }

    private setupAutoSave() {
        setInterval(() => {
            this.saveContent();
        }, this.autoSaveInterval);
    }

    private initializeToolbar() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            const action = btn.dataset.action;
            if (action) {
                btn.addEventListener('click', () => {
                    switch (action) {
                        case 'template':
                            this.showTemplateDialog();
                            break;
                        case 'text':
                            this.showTextStyleDialog();
                            break;
                        case 'style':
                            this.showStyleDialog();
                            break;
                        case 'undo':
                            this.undo();
                            break;
                        case 'redo':
                            this.redo();
                            break;
                    }
                });
            }
        });
    }

    private setupEventListeners() {
        // 编辑器内容变化
        this.editor.addEventListener('input', () => {
            this.updatePreview();
            this.addToHistory();
        });

        // 下载按钮
        document.querySelector('[data-action="download"]')?.addEventListener('click', () => {
            this.downloadImage();
        });

        // 分享按钮
        document.querySelector('[data-action="share"]')?.addEventListener('click', () => {
            this.shareContent();
        });

        // 快捷键支持
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.saveContent();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                }
            }
        });
    }

    private async downloadImage() {
        try {
            // 将预览区域转换为图片
            const canvas = await html2canvas(this.preview);
            const dataUrl = canvas.toDataURL('image/png');

            // 创建下载链接
            const link = document.createElement('a');
            link.download = `金句卡片_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            this.errorHandler.handleError(error, 'downloadImage');
            this.uiManager.showNotification('导出图片失败', 'error');
        }
    }

    private async shareContent() {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: '金句卡片',
                    text: this.editor.textContent,
                    url: window.location.href
                });
            } else {
                // 复制到剪贴板
                await navigator.clipboard.writeText(this.editor.textContent);
                this.uiManager.showNotification('内容已复制到剪贴板', 'success');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'shareContent');
            this.uiManager.showNotification('分享失败', 'error');
        }
    }
}

export default EditorManager;
