class AccessibilityManager {
    constructor() {
        this.config = {
            enabled: true,
            highContrast: false,
            fontSize: 'normal',
            animations: true,
            screenReader: true
        };
        this.init();
    }

    // 初始化
    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.applySettings();
    }

    // 加载配置
    async loadConfig() {
        try {
            const stored = await chrome.storage.sync.get('accessibility');
            if (stored.accessibility) {
                this.config = { ...this.config, ...stored.accessibility };
            }
        } catch (error) {
            console.error('Failed to load accessibility config:', error);
        }
    }

    // 保存配置
    async saveConfig() {
        try {
            await chrome.storage.sync.set({ accessibility: this.config });
        } catch (error) {
            console.error('Failed to save accessibility config:', error);
        }
    }

    // 更新配置
    async updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        await this.saveConfig();
        this.applySettings();
    }

    // 应用设置
    applySettings() {
        document.documentElement.classList.toggle('high-contrast', this.config.highContrast);
        document.documentElement.classList.toggle('no-animations', !this.config.animations);
        document.documentElement.setAttribute('data-font-size', this.config.fontSize);

        if (this.config.screenReader) {
            this.enableScreenReaderSupport();
        }
    }

    // 启用屏幕阅读器支持
    enableScreenReaderSupport() {
        // 添加 ARIA 标签
        document.querySelectorAll('[data-accessible]').forEach(element => {
            const role = element.getAttribute('data-role');
            const label = element.getAttribute('data-label');

            if (role) element.setAttribute('role', role);
            if (label) element.setAttribute('aria-label', label);
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听键盘导航
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // 监听焦点管理
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
    }

    // 处理键盘导航
    handleKeyboardNavigation(event) {
        if (!this.config.enabled) return;

        // Tab 键导航
        if (event.key === 'Tab') {
            this.updateFocusIndicators(true);
        }

        // 快捷键支持
        if (event.altKey && event.key === 'A') {
            this.toggleAccessibilityMenu();
        }
    }

    // 处理焦点
    handleFocusIn(event) {
        if (!this.config.enabled) return;

        const element = event.target;
        this.announceElement(element);
    }

    // 更新焦点指示器
    updateFocusIndicators(keyboard) {
        document.body.classList.toggle('keyboard-navigation', keyboard);
    }

    // 朗读元素
    announceElement(element) {
        if (!this.config.screenReader) return;

        const announcement = element.getAttribute('aria-label') ||
                           element.getAttribute('title') ||
                           element.textContent;

        if (announcement) {
            this.announce(announcement);
        }
    }

    // 朗读文本
    announce(text) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'alert');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = text;

        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // 获取当前配置
    getConfig() {
        return { ...this.config };
    }
}

export default new AccessibilityManager();
