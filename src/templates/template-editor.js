class TemplateEditor {
    constructor(templateManager) {
        this.templateManager = templateManager;
        this.container = null;
        this.currentTemplate = null;
        this.onSave = null;
    }

    // 创建编辑器界面
    createEditor() {
        const container = document.createElement('div');
        container.className = 'template-editor';

        container.innerHTML = `
            <div class="editor-header">
                <h2>${chrome.i18n.getMessage('editTemplate')}</h2>
                <button class="close-btn">×</button>
            </div>
            <div class="editor-content">
                <div class="style-section">
                    <h3>${chrome.i18n.getMessage('styleSettings')}</h3>
                    <div class="style-controls">
                        <div class="control-group">
                            <label>${chrome.i18n.getMessage('background')}</label>
                            <input type="color" id="bgColor">
                        </div>
                        <div class="control-group">
                            <label>${chrome.i18n.getMessage('textColor')}</label>
                            <input type="color" id="textColor">
                        </div>
                        <div class="control-group">
                            <label>${chrome.i18n.getMessage('fontSize')}</label>
                            <input type="range" id="fontSize" min="12" max="48" step="1">
                            <span class="value"></span>
                        </div>
                        <div class="control-group">
                            <label>${chrome.i18n.getMessage('fontFamily')}</label>
                            <select id="fontFamily">
                                <option value="inherit">${chrome.i18n.getMessage('systemFont')}</option>
                                <option value="Georgia, serif">Georgia</option>
                                <option value="'Times New Roman', serif">Times New Roman</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="layout-section">
                    <h3>${chrome.i18n.getMessage('layoutSettings')}</h3>
                    <div class="layout-controls">
                        <div class="control-group">
                            <label>${chrome.i18n.getMessage('textAlign')}</label>
                            <select id="textAlign">
                                <option value="left">${chrome.i18n.getMessage('alignLeft')}</option>
                                <option value="center">${chrome.i18n.getMessage('alignCenter')}</option>
                                <option value="right">${chrome.i18n.getMessage('alignRight')}</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label>${chrome.i18n.getMessage('padding')}</label>
                            <input type="range" id="padding" min="0" max="80" step="4">
                            <span class="value"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="editor-footer">
                <button class="btn" id="cancelBtn">${chrome.i18n.getMessage('cancel')}</button>
                <button class="btn primary" id="saveBtn">${chrome.i18n.getMessage('save')}</button>
            </div>
        `;

        this.setupEventListeners(container);
        this.container = container;
        return container;
    }

    // 设置事件监听
    setupEventListeners(container) {
        // 关闭按钮
        container.querySelector('.close-btn').addEventListener('click', () => this.hide());

        // 取消按钮
        container.querySelector('#cancelBtn').addEventListener('click', () => this.hide());

        // 保存按钮
        container.querySelector('#saveBtn').addEventListener('click', () => this.saveTemplate());

        // 样式控件
        const controls = container.querySelectorAll('input, select');
        controls.forEach(control => {
            control.addEventListener('change', () => this.updatePreview());
            if (control.type === 'range') {
                control.nextElementSibling.textContent = control.value;
                control.addEventListener('input', (e) => {
                    e.target.nextElementSibling.textContent = e.target.value;
                    this.updatePreview();
                });
            }
        });
    }

    // 显示编辑器
    show(template) {
        if (!this.container) {
            this.createEditor();
        }
        this.currentTemplate = template;
        this.loadTemplateValues();
        document.body.appendChild(this.container);
    }

    // 隐藏编辑器
    hide() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    // 加载模板值
    loadTemplateValues() {
        if (!this.currentTemplate) return;

        const { style } = this.currentTemplate;
        const controls = this.container.querySelectorAll('input, select');

        controls.forEach(control => {
            const id = control.id;
            if (style[id]) {
                control.value = style[id];
                if (control.type === 'range') {
                    control.nextElementSibling.textContent = control.value;
                }
            }
        });
    }

    // 更新预览
    updatePreview() {
        if (!this.currentTemplate) return;

        const newStyle = {};
        const controls = this.container.querySelectorAll('input, select');

        controls.forEach(control => {
            newStyle[control.id] = control.value;
        });

        Object.assign(this.currentTemplate.style, newStyle);
        this.templateManager.updateTemplateContent(this.currentTemplate);
    }

    // 保存模板
    saveTemplate() {
        if (this.onSave) {
            this.onSave(this.currentTemplate);
        }
        this.hide();
    }

    // 设置保存回调
    setOnSave(callback) {
        this.onSave = callback;
    }
}

export default TemplateEditor;
