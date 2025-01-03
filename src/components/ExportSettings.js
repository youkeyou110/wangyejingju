export class ExportSettings {
    constructor(container, onExport) {
        this.container = container;
        this.onExport = onExport;
        this.initializeUI();
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="export-settings">
                <div class="export-row">
                    <label>导出格式：</label>
                    <select id="export-format">
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="webp">WEBP</option>
                    </select>
                </div>

                <div class="export-row">
                    <label>图片质量：</label>
                    <input type="range" id="export-quality" min="0.1" max="1.0" step="0.1" value="1.0">
                    <span id="quality-value">100%</span>
                </div>

                <div class="export-row">
                    <label>自定义尺寸：</label>
                    <input type="checkbox" id="custom-size">
                </div>

                <div class="size-inputs" style="display: none;">
                    <div class="export-row">
                        <label>宽度：</label>
                        <input type="number" id="export-width" value="800">
                        <span>px</span>
                    </div>

                    <div class="export-row">
                        <label>高度：</label>
                        <input type="number" id="export-height" value="600">
                        <span>px</span>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const qualityInput = this.container.querySelector('#export-quality');
        const qualityValue = this.container.querySelector('#quality-value');
        const customSize = this.container.querySelector('#custom-size');
        const sizeInputs = this.container.querySelector('.size-inputs');

        qualityInput.addEventListener('input', (e) => {
            qualityValue.textContent = `${Math.round(e.target.value * 100)}%`;
        });

        customSize.addEventListener('change', (e) => {
            sizeInputs.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    getSettings() {
        const format = this.container.querySelector('#export-format').value;
        const quality = parseFloat(this.container.querySelector('#export-quality').value);
        const customSize = this.container.querySelector('#custom-size').checked;

        const settings = { format, quality };

        if (customSize) {
            settings.width = parseInt(this.container.querySelector('#export-width').value);
            settings.height = parseInt(this.container.querySelector('#export-height').value);
        }

        return settings;
    }
}
