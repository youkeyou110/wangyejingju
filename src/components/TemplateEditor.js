export class TemplateEditor {
    constructor(container, onSave) {
        this.container = container;
        this.onSave = onSave;
        this.initializeUI();
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="template-editor">
                <h3>模板编辑</h3>
                <div class="editor-row">
                    <label>模板名称：</label>
                    <input type="text" id="template-name" placeholder="输入模板名称">
                </div>

                <div class="editor-section">
                    <h4>背景设置</h4>
                    <div class="editor-row">
                        <label>背景类型：</label>
                        <select id="template-bg-type">
                            <option value="color">纯色</option>
                            <option value="gradient">渐变</option>
                            <option value="image">图片</option>
                        </select>
                    </div>

                    <div id="bg-color-settings">
                        <div class="editor-row">
                            <label>背景颜色：</label>
                            <input type="color" id="template-bg-color">
                        </div>
                        <div class="editor-row" id="gradient-color" style="display: none;">
                            <label>渐变颜色：</label>
                            <input type="color" id="template-gradient-color">
                        </div>
                    </div>

                    <div id="bg-image-settings" style="display: none;">
                        <div class="editor-row">
                            <label>背景图片：</label>
                            <input type="file" id="template-bg-image" accept="image/*">
                        </div>
                    </div>
                </div>

                <div class="editor-section">
                    <h4>字体设置</h4>
                    <div class="editor-row">
                        <label>字体：</label>
                        <select id="template-font-family">
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Microsoft YaHei">微软雅黑</option>
                            <option value="SimSun">宋体</option>
                        </select>
                    </div>
                    <div class="editor-row">
                        <label>字号：</label>
                        <input type="range" id="template-font-size" min="12" max="72" value="16">
                        <span id="font-size-value">16px</span>
                    </div>
                    <div class="editor-row">
                        <label>颜色：</label>
                        <input type="color" id="template-font-color">
                    </div>
                </div>

                <div class="editor-section">
                    <h4>布局设置</h4>
                    <div class="editor-row">
                        <label>内边距：</label>
                        <input type="range" id="template-padding" min="0" max="50" value="20">
                        <span id="padding-value">20px</span>
                    </div>
                    <div class="editor-row">
                        <label>圆角：</label>
                        <input type="range" id="template-border-radius" min="0" max="50" value="8">
                        <span id="radius-value">8px</span>
                    </div>
                </div>

                <div class="editor-actions">
                    <button id="save-template" class="btn primary">保存模板</button>
                    <button id="cancel-edit" class="btn">取消</button>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const bgType = this.container.querySelector('#template-bg-type');
        const bgColorSettings = this.container.querySelector('#bg-color-settings');
        const bgImageSettings = this.container.querySelector('#bg-image-settings');
        const gradientColor = this.container.querySelector('#gradient-color');

        // 背景类型切换
        bgType.addEventListener('change', (e) => {
            switch (e.target.value) {
                case 'color':
                    bgColorSettings.style.display = 'block';
                    bgImageSettings.style.display = 'none';
                    gradientColor.style.display = 'none';
                    break;
                case 'gradient':
                    bgColorSettings.style.display = 'block';
                    bgImageSettings.style.display = 'none';
                    gradientColor.style.display = 'block';
                    break;
                case 'image':
                    bgColorSettings.style.display = 'none';
                    bgImageSettings.style.display = 'block';
                    gradientColor.style.display = 'none';
                    break;
            }
        });

        // 保存模板
        this.container.querySelector('#save-template').addEventListener('click', () => {
            const template = this.getTemplateData();
            this.onSave?.(template);
        });

        // 取消编辑
        this.container.querySelector('#cancel-edit').addEventListener('click', () => {
            this.container.style.display = 'none';
        });

        // 更新显示值
        ['font-size', 'padding', 'border-radius'].forEach(id => {
            const input = this.container.querySelector(`#template-${id}`);
            const value = this.container.querySelector(`#${id}-value`);
            input.addEventListener('input', (e) => {
                value.textContent = `${e.target.value}px`;
            });
        });
    }

    getTemplateData() {
        const bgType = this.container.querySelector('#template-bg-type').value;
        const style = {
            fontFamily: this.container.querySelector('#template-font-family').value,
            fontSize: `${this.container.querySelector('#template-font-size').value}px`,
            color: this.container.querySelector('#template-font-color').value,
            padding: `${this.container.querySelector('#template-padding').value}px`,
            borderRadius: `${this.container.querySelector('#template-border-radius').value}px`
        };

        // 设置背景
        switch (bgType) {
            case 'gradient':
                const color1 = this.container.querySelector('#template-bg-color').value;
                const color2 = this.container.querySelector('#template-gradient-color').value;
                style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
                break;
            case 'color':
                style.background = this.container.querySelector('#template-bg-color').value;
                break;
            case 'image':
                // 处理图片背景
                const fileInput = this.container.querySelector('#template-bg-image');
                if (fileInput.files[0]) {
                    // 这里需要处理图片上传
                    // TODO: 实现图片上传逻辑
                }
                break;
        }

        return {
            id: `template-${Date.now()}`,
            name: this.container.querySelector('#template-name').value || '新模板',
            style
        };
    }

    loadTemplate(template) {
        // TODO: 实现模板加载逻辑
    }
}
