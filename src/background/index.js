// 后台脚本入口
let menuCreated = false;

// 创建右键菜单函数
function createContextMenu() {
    if (!menuCreated) {
        try {
            chrome.contextMenus.removeAll(() => {
                chrome.contextMenus.create({
                    id: 'generate-quote-card',
                    title: '生成金句卡片',
                    contexts: ['selection'],
                    documentUrlPatterns: ['<all_urls>']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('创建菜单失败:', chrome.runtime.lastError);
                        return;
                    }
                    menuCreated = true;
                    console.log('右键菜单创建成功');
                });
            });
        } catch (error) {
            console.error('创建右键菜单错误:', error);
        }
    }
}

// 安装/更新时创建菜单
chrome.runtime.onInstalled.addListener(() => {
    console.log('扩展已安装');
    createContextMenu();
});

// 确保启动时创建菜单
chrome.runtime.onStartup.addListener(() => {
    console.log('扩展启动');
    createContextMenu();
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'generate-quote-card') {
        console.log('右键菜单被点击:', info.selectionText);
        // 发送消息到content script
        chrome.tabs.sendMessage(tab.id, {
            type: 'GENERATE_QUOTE_CARD',
            text: info.selectionText
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('发送消息失败:', chrome.runtime.lastError);
                return;
            }
            console.log('消息发送成功:', response);
        });
    }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_POPUP_WITH_TEXT') {
        console.log('收到打开弹窗请求:', message);
        // 存储选中的文本并返回响应
        chrome.storage.local.set({ selectedText: message.text }, () => {
            if (chrome.runtime.lastError) {
                console.error('存储文本失败:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
                return;
            }
            console.log('文本已存储');
            sendResponse({ success: true });
            // 尝试打开弹窗
            chrome.action.openPopup().catch(error => {
                console.error('打开弹窗失败:', error);
            });
        });
        return true; // 保持消息通道开放
    }
});
