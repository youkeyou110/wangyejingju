// 内容脚本入口
console.log('内容脚本已加载');

// 确保content script已注入
if (!window.contentScriptInjected) {
    window.contentScriptInjected = true;

    // 监听来自background的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'GENERATE_QUOTE_CARD') {
            // 高亮选中的文本
            highlightSelectedText();

            // 发送消息以打开弹出窗口
            chrome.runtime.sendMessage({
                type: 'OPEN_POPUP_WITH_TEXT',
                text: message.text
            }, response => {
                if (response && response.success) {
                    console.log('消息发送成功');
                }
            });
        }
        return true; // 保持消息通道开放
    });
}

// 高亮选中的文本
function highlightSelectedText() {
    try {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'quote-card-highlight';

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
