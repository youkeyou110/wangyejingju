document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('themeSelect');
    const shortcutInput = document.getElementById('shortcutInput');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    // 加载设置
    loadSettings();

    // 保存设置
    saveSettingsBtn.addEventListener('click', () => {
        const settings = {
            theme: themeSelect.value,
            shortcut: shortcutInput.value
        };
        chrome.storage.sync.set({ settings }, () => {
            alert('设置已保存');
        });
    });

    // 监听快捷键输入
    shortcutInput.addEventListener('keydown', (event) => {
        event.preventDefault();
        shortcutInput.value = event.key;
    });
});

// 加载设置
function loadSettings() {
    chrome.storage.sync.get('settings', (data) => {
        if (data.settings) {
            const { theme, shortcut } = data.settings;
            document.getElementById('themeSelect').value = theme || 'light';
            document.getElementById('shortcutInput').value = shortcut || '';
        }
    });
}
