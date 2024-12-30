class PreviewZoom {
    constructor(container, i18n) {
        this.container = container;
        this.i18n = i18n;
        this.scale = 1;
        this.minScale = 0.5;
        this.maxScale = 2;
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const controls = document.createElement('div');
        controls.className = 'zoom-controls';
        controls.innerHTML = `
            <button class="zoom-button" data-action="zoomIn" title="${this.i18n.getMessage('preview_zoom_in')}">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            </button>
            <span class="zoom-value">100%</span>
            <button class="zoom-button" data-action="zoomOut" title="${this.i18n.getMessage('preview_zoom_out')}">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 13H5v-2h14v2z"/>
                </svg>
            </button>
            <button class="zoom-button" data-action="zoomReset" title="${this.i18n.getMessage('preview_zoom_reset')}">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
            </button>
        `;

        this.container.appendChild(controls);
    }

    bindEvents() {
        // 按钮控制
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('.zoom-button');
            if (!button) return;

            switch (button.dataset.action) {
                case 'zoomIn':
                    this.zoomIn();
                    break;
                case 'zoomOut':
                    this.zoomOut();
                    break;
                case 'zoomReset':
                    this.resetZoom();
                    break;
            }
        });

        // 鼠标滚轮缩放
        this.container.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        }, { passive: false });
    }

    zoomIn() {
        if (this.scale < this.maxScale) {
            this.scale = Math.min(this.scale + 0.1, this.maxScale);
            this.updateZoom();
        }
    }

    zoomOut() {
        if (this.scale > this.minScale) {
            this.scale = Math.max(this.scale - 0.1, this.minScale);
            this.updateZoom();
        }
    }

    resetZoom() {
        this.scale = 1;
        this.updateZoom();
    }

    updateZoom() {
        // 更新预览元素的缩放
        const preview = this.container.querySelector('.preview-content');
        if (preview) {
            preview.style.transform = `scale(${this.scale})`;
        }

        // 更新缩放值显示
        const zoomValue = this.container.querySelector('.zoom-value');
        if (zoomValue) {
            zoomValue.textContent = `${Math.round(this.scale * 100)}%`;
        }

        // 触发缩放事件
        this.container.dispatchEvent(new CustomEvent('zoomChange', {
            detail: { scale: this.scale }
        }));
    }
}

export default PreviewZoom;
