// 扩展安装或更新时的处理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装，设置默认配置
    chrome.storage.local.set({
      settings: {
        userLocale: chrome.i18n.getUILanguage(),
        defaultFormat: 'png',
        defaultQuality: 0.9,
        shortcuts: {
          generate: 'Ctrl+Shift+Q',
          export: 'Ctrl+Shift+E'
        }
      }
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to save initial settings:', chrome.runtime.lastError);
      }
    });
  }
});

// 创建右键菜单
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
    // 发送消息给 content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'generateCard',
      text: info.selectionText
    });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'textSelected':
      // 处理选中文本
      console.log('Text selected:', message.text);
      break;

    case 'generateCard':
      // 处理生成卡片请求
      try {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'generateCard',
          text: message.text
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        sendResponse({ error: error.message });
      }
      break;

    case 'openPopup':
      // 打开扩展弹窗
      try {
        chrome.action.openPopup();
      } catch (error) {
        console.error('Failed to open popup:', error);
        sendResponse({ error: error.message });
      }
      break;

    case 'getSettings':
      chrome.storage.local.get('settings', (result) => {
        sendResponse(result.settings || {});
      });
      return true;

    case 'saveSettings':
      chrome.storage.local.set({
        settings: message.settings
      }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
      return true;

    default:
      console.warn('Unknown message action:', message.action);
      sendResponse({ error: 'Unknown action' });
  }
});
