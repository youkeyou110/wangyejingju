class TemplateEditor {
    constructor(templateManager, i18n, errorHandler) {
        this.templateManager = templateManager;
        this.i18n = i18n;
        this.errorHandler = errorHandler;
        this.currentTemplate = null;
        this.container = null;
        this.shortcutManager = new ShortcutManager(i18n);
        this.historyManager = new HistoryManager();
        this.isUpdating = false; // 防止循环更新
    }

    init(container) {
        this.container = container;
        this.render();
        this.bindEvents();
        this.initShortcuts();
    }

    initShortcuts() {
        // 保存模板
        this.shortcutManager.register('s', () => {
            this.saveTemplate();
        }, {
            ctrl: true,
            description: this.i18n.getMessage('shortcuts_saveTemplate')
        });

        // 重置编辑器
        this.shortcutManager.register('r', () => {
            this.resetEditor();
        }, {
            ctrl: true,
            description: this.i18n.getMessage('shortcuts_resetEditor')
        });

        // 切换网格
        this.shortcutManager.register('g', () => {
            this.container.querySelector('.grid-toggle')?.click();
        }, {
            ctrl: true,
            description: this.i18n.getMessage('shortcuts_toggleGrid')
        });

        // 撤销
        this.shortcutManager.register('z', () => {
            this.undo();
        }, {
            ctrl: true,
            description: this.i18n.getMessage('shortcuts_undo')
        });

        // 重做
        this.shortcutManager.register('y', () => {
            this.redo();
        }, {
            ctrl: true,
            description: this.i18n.getMessage('shortcuts_redo')
        });
    }

    render() {
        this.container.innerHTML = `
            <div class="template-editor">
                <div class="editor-header">
                    <h2>${this.i18n.getMessage('editor_title')}</h2>
                    <div class="editor-actions">
                        <button class="history-button" id="undoButton" disabled>
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                            </svg>
                        </button>
                        <button class="history-button" id="redoButton" disabled>
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
                            </svg>
                        </button>
                        <label class="import-button">
                            <input type="file" id="importTemplate" accept=".json" hidden />
                            ${this.i18n.getMessage('buttons_import')}
                        </label>
                    </div>
                </div>
                <div class="editor-section">
                    <h3>${this.i18n.getMessage('settings_background')}</h3>
                    <div class="background-controls">
                        <select id="backgroundType">
                            <option value="color">${this.i18n.getMessage('settings_backgroundType_solid')}</option>
                            <option value="gradient">${this.i18n.getMessage('settings_backgroundType_gradient')}</option>
                        </select>
                        <input type="color" id="backgroundColor" />
                        <div id="gradientControls" style="display: none;">
                            <select id="gradientType">
                                <option value="linear">${this.i18n.getMessage('settings_gradientType_linear')}</option>
                                <option value="radial">${this.i18n.getMessage('settings_gradientType_radial')}</option>
                            </select>
                            <input type="color" id="gradientColor1" />
                            <input type="color" id="gradientColor2" />
                        </div>
                    </div>
                </div>

                <div class="editor-section">
                    <h3>${this.i18n.getMessage('settings_font')}</h3>
                    <div class="font-controls">
                        <select id="fontFamily">
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Helvetica">Helvetica</option>
                        </select>
                        <input type="number" id="fontSize" min="12" max="72" step="1" />
                        <input type="color" id="fontColor" />
                        <select id="fontWeight">
                            <option value="normal">${this.i18n.getMessage('settings_font_weight_normal')}</option>
                            <option value="bold">${this.i18n.getMessage('settings_font_weight_bold')}</option>
                            <option value="light">${this.i18n.getMessage('settings_font_weight_light')}</option>
                        </select>
                    </div>
                </div>

                <div class="editor-section">
                    <h3>${this.i18n.getMessage('settings_layout')}</h3>
                    <div class="layout-controls">
                        <input type="number" id="padding" min="0" max="100" step="1" />
                        <input type="number" id="width" min="200" max="1000" step="10" />
                        <input type="number" id="height" min="100" max="1000" step="10" />
                    </div>
                </div>

                <div class="editor-section">
                    <h3>${this.i18n.getMessage('settings_effects')}</h3>
                    <div class="effects-controls">
                        <input type="text" id="shadow" placeholder="0 2px 4px rgba(0,0,0,0.1)" />
                        <input type="text" id="border" placeholder="1px solid #000" />
                    </div>
                </div>

                <div class="editor-actions">
                    <button id="saveTemplate">${this.i18n.getMessage('buttons_saveTemplate')}</button>
                    <button id="cancelEdit">${this.i18n.getMessage('buttons_cancel')}</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 背景类型切换
        const backgroundType = this.container.querySelector('#backgroundType');
        const gradientControls = this.container.querySelector('#gradientControls');
        backgroundType.addEventListener('change', () => {
            gradientControls.style.display =
                backgroundType.value === 'gradient' ? 'block' : 'none';
            this.updatePreview();
        });

        // 所有输入控件的变更事件
        this.container.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => this.updatePreview());
            if (input.type === 'number' || input.type === 'text') {
                input.addEventListener('input', () => this.updatePreview());
            }
        });

        // 保存模板
        this.container.querySelector('#saveTemplate').addEventListener('click', () => {
            this.saveTemplate();
        });

        // 取消编辑
        this.container.querySelector('#cancelEdit').addEventListener('click', () => {
            this.resetEditor();
        });

        // 导入模板
        this.container.querySelector('#importTemplate').addEventListener('change', async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;

                const template = await this.templateManager.importTemplate(file);
                this.loadTemplate(template);

                // 触发导入成功事件
                this.container.dispatchEvent(new CustomEvent('templateImported', {
                    detail: { template }
                }));

                e.target.value = ''; // 重置文件输入
            } catch (error) {
                this.errorHandler.handleError(error, 'importTemplate');
            }
        });

        // 拖拽导入支持
        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.add('drag-over');
        });

        this.container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('drag-over');
        });

        this.container.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.json')) {
                try {
                    const template = await this.templateManager.importTemplate(file);
                    this.loadTemplate(template);
                    this.container.dispatchEvent(new CustomEvent('templateImported', {
                        detail: { template }
                    }));
                } catch (error) {
                    this.errorHandler.handleError(error, 'importTemplate');
                }
            }
        });
    }

    // 更新预览
    updatePreview() {
        try {
            if (!this.currentTemplate) {
                throw new Error('No template loaded');
            }

            // 收集当前编辑器的值
            const style = {
                background: this.getBackgroundStyle(),
                font: this.getFontStyle(),
                layout: this.getLayoutStyle(),
                effects: this.getEffectsStyle()
            };

            // 创建临时模板
            const previewTemplate = {
                ...this.currentTemplate,
                style
            };

            // 添加更新动画
            const preview = this.container.querySelector('.preview-content');
            if (preview) {
                preview.classList.add('updating');
                setTimeout(() => {
                    preview.classList.remove('updating');
                }, 200);
            }

            // 添加到历史记录
            if (!this.isUpdating) {
                this.historyManager.push(previewTemplate);
                this.updateHistoryButtons();
            }

            // 触发预览更新事件
            this.container.dispatchEvent(new CustomEvent('previewUpdate', {
                detail: { template: previewTemplate }
            }));
        } catch (error) {
            this.errorHandler.handleError(error, 'updatePreview');
        }
    }

    // 获取背景样式
    getBackgroundStyle() {
        const type = this.container.querySelector('#backgroundType').value;
        if (type === 'color') {
            return {
                type: 'color',
                value: this.container.querySelector('#backgroundColor').value
            };
        } else {
            const gradientType = this.container.querySelector('#gradientType').value;
            const color1 = this.container.querySelector('#gradientColor1').value;
            const color2 = this.container.querySelector('#gradientColor2').value;
            return {
                type: 'gradient',
                value: `${gradientType}-gradient(45deg, ${color1}, ${color2})`
            };
        }
    }

    // 获取字体样式
    getFontStyle() {
        return {
            family: this.container.querySelector('#fontFamily').value,
            size: `${this.container.querySelector('#fontSize').value}px`,
            color: this.container.querySelector('#fontColor').value,
            weight: this.container.querySelector('#fontWeight').value,
            lineHeight: '1.5',
            letterSpacing: 'normal'
        };
    }

    // 获取布局样式
    getLayoutStyle() {
        return {
            padding: `${this.container.querySelector('#padding').value}px`,
            width: `${this.container.querySelector('#width').value}px`,
            height: this.container.querySelector('#height').value === 'auto'
                ? 'auto'
                : `${this.container.querySelector('#height').value}px`
        };
    }

    // 获取特效样式
    getEffectsStyle() {
        return {
            shadow: this.container.querySelector('#shadow').value,
            border: this.container.querySelector('#border').value
        };
    }

    // 保存模板
    async saveTemplate() {
        try {
            const name = prompt(
                this.i18n.getMessage('messages_prompt_templateName'),
                this.currentTemplate?.name || ''
            );

            if (!name) return;

            const template = {
                name,
                style: {
                    background: this.getBackgroundStyle(),
                    font: this.getFontStyle(),
                    layout: this.getLayoutStyle(),
                    effects: this.getEffectsStyle()
                }
            };

            await this.templateManager.saveTemplate(template);
            this.resetEditor();

            // 触发保存成功事件
            this.container.dispatchEvent(new CustomEvent('templateSaved', {
                detail: { template }
            }));
        } catch (error) {
            this.errorHandler.handleError(error, 'saveTemplate');
        }
    }

    // 重置编辑器
    resetEditor() {
        this.currentTemplate = null;
        this.container.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'color') {
                input.value = '#000000';
            } else if (input.type === 'number') {
                input.value = input.defaultValue || '0';
            } else {
                input.value = input.firstElementChild?.value || '';
            }
        });
        this.updatePreview();
    }

    // 加载模板
    loadTemplate(template) {
        try {
            this.currentTemplate = template;
            const { style } = template;

            // 设置背景
            if (style.background.type === 'color') {
                this.container.querySelector('#backgroundType').value = 'color';
                this.container.querySelector('#backgroundColor').value = style.background.value;
                this.container.querySelector('#gradientControls').style.display = 'none';
            } else {
                this.container.querySelector('#backgroundType').value = 'gradient';
                this.container.querySelector('#gradientControls').style.display = 'block';
                // 解析渐变色
                const colors = style.background.value.match(/#[a-f\d]{6}/gi) || ['#000000', '#ffffff'];
                this.container.querySelector('#gradientColor1').value = colors[0];
                this.container.querySelector('#gradientColor2').value = colors[1];
            }

            // 设置字体
            Object.entries(style.font).forEach(([prop, value]) => {
                const input = this.container.querySelector(`#font${prop.charAt(0).toUpperCase() + prop.slice(1)}`);
                if (input) {
                    input.value = value.replace('px', '');
                }
            });

            // 设置布局
            Object.entries(style.layout).forEach(([prop, value]) => {
                const input = this.container.querySelector(`#${prop}`);
                if (input) {
                    input.value = value.replace('px', '');
                }
            });

            // 设置特效
            this.container.querySelector('#shadow').value = style.effects.shadow || '';
            this.container.querySelector('#border').value = style.effects.border || '';

            this.updatePreview();
        } catch (error) {
            this.errorHandler.handleError(error, 'loadTemplate');
        }
    }

    // 撤销
    undo() {
        try {
            const state = this.historyManager.undo();
            if (state) {
                this.isUpdating = true;
                this.loadTemplate(state);
                this.updateHistoryButtons();
                this.isUpdating = false;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'undo');
        }
    }

    // 重做
    redo() {
        try {
            const state = this.historyManager.redo();
            if (state) {
                this.isUpdating = true;
                this.loadTemplate(state);
                this.updateHistoryButtons();
                this.isUpdating = false;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'redo');
        }
    }

    // 更新历史按钮状态
    updateHistoryButtons() {
        const undoButton = this.container.querySelector('#undoButton');
        const redoButton = this.container.querySelector('#redoButton');

        if (undoButton) {
            undoButton.disabled = !this.historyManager.canUndo();
        }
        if (redoButton) {
            redoButton.disabled = !this.historyManager.canRedo();
        }
    }
}

export default TemplateEditor;
