export class StyleEditor {
    constructor(container, onChange) {
        this.container = container;
        this.onChange = onChange;
        this.initializeUI();
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="style-editor">
                <div class="style-section">
                    <h3>背景设置</h3>
                    <div class="style-row">
                        <label>背景类型：</label>
                        <select id="bg-type">
                            <option value="color">纯色</option>
                            <option value="gradient">渐变</option>
                            <option value="image">图片</option>
                        </select>
                    </div>
                    <div id="bg-color-picker" class="style-row">
                        <label>背景颜色：</label>
                        <input type="color" id="bg-color" value="#ffffff">
                    </div>
                </div>

                <div class="style-section">
                    <h3>字体设置</h3>
                    <div class="style-row">
                        <label>字体：</label>
                        <select id="font-family">
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Microsoft YaHei">微软雅黑</option>
                            <option value="SimSun">宋体</option>
                        </select>
                    </div>
                    <div class="style-row">
                        <label>字号：</label>
                        <input type="range" id="font-size" min="12" max="72" value="16">
                        <span id="font-size-value">16px</span>
                    </div>
                    <div class="style-row">
                        <label>颜色：</label>
                        <input type="color" id="font-color" value="#000000">
                    </div>
                </div>

                <div class="style-section">
                    <h3>布局设置</h3>
                    <div class="style-row">
                        <label>对齐：</label>
                        <select id="text-align">
                            <option value="left">左对齐</option>
                            <option value="center">居中</option>
                            <option value="right">右对齐</option>
                        </select>
                    </div>
                    <div class="style-row">
                        <label>内边距：</label>
                        <input type="range" id="padding" min="0" max="50" value="20">
                        <span id="padding-value">20px</span>
                    </div>
                </div>

                <div class="style-section">
                    <h3>特效设置</h3>
                    <div class="style-row">
                        <label>阴影：</label>
                        <input type="checkbox" id="box-shadow">
                    </div>
                    <div class="style-row">
                        <label>边框：</label>
                        <input type="checkbox" id="border">
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const elements = {
            bgType: this.container.querySelector('#bg-type'),
            bgColor: this.container.querySelector('#bg-color'),
            fontFamily: this.container.querySelector('#font-family'),
            fontSize: this.container.querySelector('#font-size'),
            fontColor: this.container.querySelector('#font-color'),
            textAlign: this.container.querySelector('#text-align'),
            padding: this.container.querySelector('#padding'),
            boxShadow: this.container.querySelector('#box-shadow'),
            border: this.container.querySelector('#border')
        };

        // 更新显示值
        elements.fontSize.addEventListener('input', (e) => {
            this.container.querySelector('#font-size-value').textContent = `${e.target.value}px`;
        });

        elements.padding.addEventListener('input', (e) => {
            this.container.querySelector('#padding-value').textContent = `${e.target.value}px`;
        });

        // 监听所有输入变化
        Object.values(elements).forEach(element => {
            element.addEventListener('change', () => this.updateStyle());
            element.addEventListener('input', () => this.updateStyle());
        });
    }

    updateStyle() {
        const style = {
            background: this.getBackgroundStyle(),
            fontFamily: this.container.querySelector('#font-family').value,
            fontSize: `${this.container.querySelector('#font-size').value}px`,
            color: this.container.querySelector('#font-color').value,
            textAlign: this.container.querySelector('#text-align').value,
            padding: `${this.container.querySelector('#padding').value}px`,
            boxShadow: this.container.querySelector('#box-shadow').checked ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            border: this.container.querySelector('#border').checked ? '1px solid #ddd' : 'none'
        };

        this.onChange(style);
    }

    getBackgroundStyle() {
        const type = this.container.querySelector('#bg-type').value;
        const color = this.container.querySelector('#bg-color').value;

        switch (type) {
            case 'gradient':
                return `linear-gradient(135deg, ${color}, ${this.adjustColor(color)})`;
            case 'color':
            default:
                return color;
        }
    }

    adjustColor(color) {
        // 简单的颜色调整逻辑
        const r = parseInt(color.slice(1,3), 16);
        const g = parseInt(color.slice(3,5), 16);
        const b = parseInt(color.slice(5,7), 16);

        return `#${Math.max(0, r-40).toString(16).padStart(2,'0')}${
            Math.max(0, g-40).toString(16).padStart(2,'0')}${
            Math.max(0, b-40).toString(16).padStart(2,'0')}`;
    }
}
