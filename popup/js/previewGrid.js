class PreviewGrid {
    constructor(container, i18n) {
        this.container = container;
        this.i18n = i18n;
        this.enabled = false;
        this.gridSize = 20; // 默认网格大小
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const controls = document.createElement('div');
        controls.className = 'grid-controls';
        controls.innerHTML = `
            <button class="grid-toggle" title="${this.i18n.getMessage('preview_grid_toggle')}">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/>
                </svg>
            </button>
            <input type="number" class="grid-size" min="5" max="50" step="5" value="${this.gridSize}"
                title="${this.i18n.getMessage('preview_grid_size')}" />
        `;

        this.container.appendChild(controls);
    }

    bindEvents() {
        const toggle = this.container.querySelector('.grid-toggle');
        const sizeInput = this.container.querySelector('.grid-size');

        toggle.addEventListener('click', () => {
            this.enabled = !this.enabled;
            this.updateGrid();
            toggle.classList.toggle('active');
        });

        sizeInput.addEventListener('change', () => {
            this.gridSize = parseInt(sizeInput.value, 10);
            if (this.enabled) {
                this.updateGrid();
            }
        });
    }

    updateGrid() {
        const preview = this.container.querySelector('.preview-content');
        if (!preview) return;

        if (this.enabled) {
            preview.style.backgroundImage = `
                linear-gradient(to right, rgba(0,0,0,.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,.1) 1px, transparent 1px)
            `;
            preview.style.backgroundSize = `${this.gridSize}px ${this.gridSize}px`;
        } else {
            preview.style.backgroundImage = 'none';
        }
    }
}

export default PreviewGrid;
