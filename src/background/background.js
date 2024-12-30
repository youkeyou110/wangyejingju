// 扩展安装/更新时的处理
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        // 初始化设置
        await initializeSettings();
    } else if (details.reason === 'update') {
        // 处理更新
        await handleUpdate(details.previousVersion);
    }
});

// 初始化设置
async function initializeSettings() {
    const defaultSettings = {
        theme: 'light',
        language: chrome.i18n.getUILanguage(),
        autoSave: true,
        syncEnabled: true
    };

    await chrome.storage.local.set({ settings: defaultSettings });
}

// 处理更新
async function handleUpdate(previousVersion) {
    // 版本迁移逻辑
    const migrations = {
        async '1.0.0'() {
            // 1.0.0 版本的迁移代码
        }
    };

    // 执行迁移
    for (const version in migrations) {
        if (compareVersions(previousVersion, version) < 0) {
            await migrations[version]();
        }
    }
}

// 消息处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'getData':
            handleGetData(request.key).then(sendResponse);
            return true;
        case 'setData':
            handleSetData(request.key, request.value).then(sendResponse);
            return true;
        case 'sync':
            handleSync().then(sendResponse);
            return true;
    }
});

// 数据处理函数
async function handleGetData(key) {
    try {
        const result = await chrome.storage.local.get(key);
        return { success: true, data: result[key] };
    } catch (error) {
        console.error('getData error:', error);
        return { success: false, error: error.message };
    }
}

async function handleSetData(key, value) {
    try {
        await chrome.storage.local.set({ [key]: value });
        return { success: true };
    } catch (error) {
        console.error('setData error:', error);
        return { success: false, error: error.message };
    }
}

async function handleSync() {
    try {
        // 实现数据同步逻辑
        return { success: true };
    } catch (error) {
        console.error('sync error:', error);
        return { success: false, error: error.message };
    }
}

// 工具函数
function compareVersions(a, b) {
    const pa = a.split('.');
    const pb = b.split('.');
    for (let i = 0; i < 3; i++) {
        const na = Number(pa[i]);
        const nb = Number(pb[i]);
        if (na > nb) return 1;
        if (nb > na) return -1;
        if (!isNaN(na) && isNaN(nb)) return 1;
        if (isNaN(na) && !isNaN(nb)) return -1;
    }
    return 0;
}
