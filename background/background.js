// 扩展安装或更新时的处理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装
    chrome.storage.local.set({
      settings: {
        userLocale: chrome.i18n.getUILanguage(),
        defaultFormat: 'png',
        defaultQuality: 0.9
      }
    });
  }
});

// 添加右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generateQuoteCard',
    title: chrome.i18n.getMessage('menuTitle'),
    contexts: ['selection']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generateQuoteCard') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'GENERATE_CARD',
      text: info.selectionText
    });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SETTINGS':
      chrome.storage.local.get('settings', (result) => {
        sendResponse(result.settings);
      });
      return true; // 保持消息通道开启

    case 'SAVE_SETTINGS':
      chrome.storage.local.set({
        settings: message.settings
      }, () => {
        sendResponse({ success: true });
      });
      return true;
  }
});
