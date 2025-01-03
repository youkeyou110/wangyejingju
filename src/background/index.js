// 后台脚本入口
chrome.runtime.onInstalled.addListener(() => {
    console.log('扩展已安装');

    // 创建右键菜单
    chrome.contextMenus.create({
        id: 'generate-quote-card',
        title: '生成金句卡片',
        contexts: ['selection']
    });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'generate-quote-card') {
        // 发送消息到content script
        chrome.tabs.sendMessage(tab.id, {
            type: 'GENERATE_QUOTE_CARD',
            text: info.selectionText
        });
    }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_POPUP_WITH_TEXT') {
        // 存储选中的文本
        chrome.storage.local.set({ selectedText: message.text }, () => {
            // 打开弹出窗口
            chrome.action.openPopup();
        });
    }
});
