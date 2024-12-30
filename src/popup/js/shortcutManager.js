class ShortcutManager {
    constructor() {
        this.shortcuts = {};
        this.loadShortcuts();
    }

    async loadShortcuts() {
        const result = await chrome.storage.local.get('shortcuts');
        this.shortcuts = result.shortcuts || {};
        this.bindShortcuts();
    }

    bindShortcuts() {
        document.addEventListener('keydown', (event) => {
            const shortcut = this.getShortcutFromEvent(event);
            if (shortcut && this.shortcuts[shortcut]) {
                event.preventDefault();
                this.executeShortcut(this.shortcuts[shortcut]);
            }
        });
    }

    getShortcutFromEvent(event) {
        const modifiers = [];
        if (event.ctrlKey) modifiers.push('Ctrl');
        if (event.altKey) modifiers.push('Alt');
        if (event.shiftKey) modifiers.push('Shift');
        if (event.metaKey) modifiers.push('Meta');

        return [...modifiers, event.key].join('+');
    }

    async executeShortcut(action) {
        switch (action) {
            case 'capture':
                await this.captureQuote();
                break;
            case 'save':
                await this.saveCard();
                break;
            case 'share':
                await this.shareCard();
                break;
            default:
                console.log('Unknown shortcut action:', action);
        }
    }

    async updateShortcut(key, action) {
        this.shortcuts[key] = action;
        await chrome.storage.local.set({ shortcuts: this.shortcuts });
    }
}

export default new ShortcutManager();
