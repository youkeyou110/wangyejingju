// 扩展安装/更新时的处理
chrome.runtime.onInstalled.addListener(() => {
    // 初始化存储
    chrome.storage.local.set({
        templates: [],
        settings: {
            theme: 'light',
            shortcuts: {},
            exportOptions: {
                format: 'png',
                quality: 'high'
            }
        }
    });
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'CAPTURE_QUOTE':
            captureQuote(request.data, sendResponse);
            break;
        case 'SYNC_DATA':
            syncData(request.data, sendResponse);
            break;
        default:
            console.log('Unknown message type:', request.type);
    }
    return true;
});

// 捕获引用内容
async function captureQuote(data, sendResponse) {
    try {
        // 实现引用捕获逻辑
        sendResponse({ success: true });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// 数据同步
async function syncData(data, sendResponse) {
    try {
        // 实现数据同步逻辑
        sendResponse({ success: true });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}
