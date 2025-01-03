class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
    }

    // 注册快捷键
    register(key, callback, options = {}) {
        const {
            ctrl = false,
            shift = false,
            alt = false,
            meta = false,
            description = ''
        } = options;

        const shortcut = {
            key: key.toLowerCase(),
            ctrl,
            shift,
            alt,
            meta,
            callback,
            description
        };

        const id = this.getShortcutId(shortcut);
        this.shortcuts.set(id, shortcut);

        return () => this.shortcuts.delete(id);
    }

    // 处理键盘事件
    handleKeyDown = (e) => {
        if (!this.enabled) return;

        const shortcut = {
            key: e.key.toLowerCase(),
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
            meta: e.metaKey
        };

        const id = this.getShortcutId(shortcut);
        const registered = this.shortcuts.get(id);

        if (registered) {
            e.preventDefault();
            registered.callback(e);
        }
    };

    // 生成快捷键ID
    getShortcutId(shortcut) {
        const { key, ctrl, shift, alt, meta } = shortcut;
        return `${ctrl ? 'ctrl+' : ''}${shift ? 'shift+' : ''}${alt ? 'alt+' : ''}${meta ? 'meta+' : ''}${key}`;
    }

    // 获取快捷键列表
    getShortcuts() {
        return Array.from(this.shortcuts.values()).map(shortcut => ({
            id: this.getShortcutId(shortcut),
            ...shortcut
        }));
    }

    // 启用快捷键
    enable() {
        this.enabled = true;
    }

    // 禁用快捷键
    disable() {
        this.enabled = false;
    }

    // 初始化
    init() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    // 销毁
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.shortcuts.clear();
    }
}

export default new KeyboardManager();
