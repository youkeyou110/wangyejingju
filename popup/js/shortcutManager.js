class ShortcutManager {
    constructor(storageManager, uiManager, errorHandler) {
        this.storageManager = storageManager;
        this.uiManager = uiManager;
        this.errorHandler = errorHandler;
        this.shortcuts = new Map();
        this.initialized = false;
    }

    async initialize() {
        try {
            // 注册默认快捷键
            this.registerDefaultShortcuts();

            // 加载用户自定义快捷键
            await this.loadUserShortcuts();

            // 绑定事件监听
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'shortcutInitialize');
        }
    }

    // 快捷键管理
    registerShortcut(id, config) {
        try {
            if (!this.validateShortcutConfig(config)) {
                throw new Error('Invalid shortcut configuration');
            }

            this.shortcuts.set(id, {
                ...config,
                enabled: config.enabled ?? true
            });

            // 更新快捷键显示
            this.updateShortcutDisplay(id);

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'registerShortcut');
            return false;
        }
    }

    async updateShortcut(id, updates) {
        try {
            const shortcut = this.shortcuts.get(id);
            if (!shortcut) {
                throw new Error(`Shortcut ${id} not found`);
            }

            const updatedConfig = { ...shortcut, ...updates };
            if (!this.validateShortcutConfig(updatedConfig)) {
                throw new Error('Invalid shortcut configuration after update');
            }

            this.shortcuts.set(id, updatedConfig);

            // 保存更改
            await this.saveUserShortcuts();

            // 更新显示
            this.updateShortcutDisplay(id);

            // 触发更新事件
            document.dispatchEvent(new CustomEvent('shortcutUpdated', {
                detail: { id, config: updatedConfig }
            }));

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'updateShortcut');
            return false;
        }
    }

    // 快捷键处理
    handleKeyEvent(event) {
        try {
            // 忽略输入框中的快捷键
            if (this.isInputElement(event.target)) {
                return;
            }

            const shortcutKey = this.getShortcutKey(event);
            for (const [id, config] of this.shortcuts) {
                if (config.enabled && config.key === shortcutKey) {
                    event.preventDefault();
                    config.action();
                    return true;
                }
            }

            return false;
        } catch (error) {
            this.errorHandler.handleError(error, 'handleKeyEvent');
            return false;
        }
    }

    // 私有方法
    private registerDefaultShortcuts() {
        // 编辑器快捷键
        this.registerShortcut('new', {
            key: 'ctrl+n',
            description: '新建',
            category: 'editor',
            action: () => {
                document.dispatchEvent(new CustomEvent('newDocument'));
            }
        });

        this.registerShortcut('save', {
            key: 'ctrl+s',
            description: '保存',
            category: 'editor',
            action: () => {
                document.dispatchEvent(new CustomEvent('saveDocument'));
            }
        });

        this.registerShortcut('undo', {
            key: 'ctrl+z',
            description: '撤销',
            category: 'editor',
            action: () => {
                document.dispatchEvent(new CustomEvent('undo'));
            }
        });

        this.registerShortcut('redo', {
            key: 'ctrl+shift+z',
            description: '重做',
            category: 'editor',
            action: () => {
                document.dispatchEvent(new CustomEvent('redo'));
            }
        });

        // 工具栏快捷键
        this.registerShortcut('template', {
            key: 'ctrl+t',
            description: '模板',
            category: 'toolbar',
            action: () => {
                document.dispatchEvent(new CustomEvent('openTemplates'));
            }
        });

        this.registerShortcut('export', {
            key: 'ctrl+e',
            description: '导出',
            category: 'toolbar',
            action: () => {
                document.dispatchEvent(new CustomEvent('exportDocument'));
            }
        });
    }

    private async loadUserShortcuts() {
        try {
            const userShortcuts = await this.storageManager.getData('userShortcuts');
            if (userShortcuts) {
                Object.entries(userShortcuts).forEach(([id, config]) => {
                    if (this.shortcuts.has(id)) {
                        this.shortcuts.set(id, { ...this.shortcuts.get(id), ...config });
                    }
                });
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'loadUserShortcuts');
        }
    }

    private async saveUserShortcuts() {
        try {
            const userShortcuts = {};
            this.shortcuts.forEach((config, id) => {
                if (config.custom || config.modified) {
                    userShortcuts[id] = config;
                }
            });
            await this.storageManager.saveData('userShortcuts', userShortcuts);
        } catch (error) {
            this.errorHandler.handleError(error, 'saveUserShortcuts');
        }
    }

    private validateShortcutConfig(config) {
        return config
            && config.key
            && config.description
            && config.category
            && typeof config.action === 'function';
    }

    private getShortcutKey(event) {
        const modifiers = [];
        if (event.ctrlKey) modifiers.push('ctrl');
        if (event.shiftKey) modifiers.push('shift');
        if (event.altKey) modifiers.push('alt');
        if (event.metaKey) modifiers.push('meta');

        const key = event.key.toLowerCase();
        return [...modifiers, key].join('+');
    }

    private isInputElement(element) {
        return element.tagName === 'INPUT'
            || element.tagName === 'TEXTAREA'
            || element.isContentEditable;
    }

    private updateShortcutDisplay(id) {
        const shortcut = this.shortcuts.get(id);
        if (!shortcut) return;

        // 更新设置页面中的快捷键显示
        const shortcutEl = document.querySelector(`[data-shortcut="${id}"]`);
        if (shortcutEl) {
            const keys = shortcut.key.split('+');
            shortcutEl.innerHTML = keys.map(key => `<kbd>${key}</kbd>`).join('+');
        }
    }

    private setupEventListeners() {
        // 全局快捷键监听
        document.addEventListener('keydown', (e) => {
            this.handleKeyEvent(e);
        });

        // 监听快捷键设置变更
        document.addEventListener('shortcutSettingChanged', async (e) => {
            const { id, key } = e.detail;
            await this.updateShortcut(id, { key, modified: true });
        });
    }
}

export default ShortcutManager;
