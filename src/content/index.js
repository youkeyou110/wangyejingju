// 内容脚本入口
console.log('内容脚本已加载');

// 监听来自background的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GENERATE_QUOTE_CARD') {
        // 高亮选中的文本
        highlightSelectedText();

        // 发送消息以打开弹出窗口
        chrome.runtime.sendMessage({
            type: 'OPEN_POPUP_WITH_TEXT',
            text: message.text
        });
    }
});

// 高亮选中的文本
function highlightSelectedText() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'quote-card-highlight';
    span.style.backgroundColor = 'rgba(66, 133, 244, 0.2)';
    span.style.transition = 'background-color 0.3s ease';

    try {
        range.surroundContents(span);

        // 3秒后移除高亮
        setTimeout(() => {
            const parent = span.parentNode;
            if (parent) {
                parent.replaceChild(span.firstChild, span);
            }
        }, 3000);
    } catch (e) {
        console.error('无法高亮选中的文本:', e);
    }
}
