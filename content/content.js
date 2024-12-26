// 监听文本选择事件
document.addEventListener('mouseup', function(event) {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    // 向background发送选中的文本
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      text: selectedText
    });
  }
});

// 监听快捷键
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+Q 或 Command+Shift+Q
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Q') {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      chrome.runtime.sendMessage({
        type: 'GENERATE_CARD',
        text: selectedText
      });
    }
  }
});

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_CARD') {
    // 打开弹出窗口并传递选中的文本
    chrome.runtime.sendMessage({
      type: 'OPEN_POPUP',
      text: message.text
    });
  }
});

// 注入样式以支持预览
const style = document.createElement('style');
style.textContent = `
  .quote-card-preview {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
  }
`;
document.head.appendChild(style);
