import { setupMessageHandlers } from './messageHandlers';
import { setupSelectionHandlers } from './selectionHandlers';
import { setupKeyboardShortcuts } from './keyboardShortcuts';
import logManager from '../managers/LogManager';

// 初始化内容脚本
const initialize = async () => {
    try {
        // 初始化消息处理器
        setupMessageHandlers();

        // 设置文本选择处理器
        setupSelectionHandlers();

        // 设置键盘快捷键
        setupKeyboardShortcuts();

        // 记录初始化成功
        logManager.info('Content script initialized successfully');
    } catch (error) {
        logManager.error('Content script initialization failed:', error);
    }
};

// 监听DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        const { type, data } = message;

        switch (type) {
            case 'GET_SELECTION':
                // 获取选中文本
                const selection = window.getSelection().toString();
                sendResponse({ success: true, data: selection });
                break;

            case 'HIGHLIGHT_TEXT':
                // 高亮文本
                highlightText(data.text);
                sendResponse({ success: true });
                break;

            case 'CLEAR_HIGHLIGHT':
                // 清除高亮
                clearHighlight();
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ success: false, error: 'Unknown message type' });
        }
    } catch (error) {
        logManager.error('Message handling failed:', error);
        sendResponse({ success: false, error: error.message });
    }

    return true; // 保持消息通道开放
});

// 高亮文本
const highlightText = (text) => {
    const range = document.createRange();
    const selection = window.getSelection();

    // 查找文本节点
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        const index = node.textContent.indexOf(text);
        if (index >= 0) {
            range.setStart(node, index);
            range.setEnd(node, index + text.length);
            selection.removeAllRanges();
            selection.addRange(range);

            // 创建高亮元素
            const highlight = document.createElement('span');
            highlight.className = 'quote-card-highlight';
            highlight.style.backgroundColor = 'yellow';
            highlight.style.opacity = '0.5';

            range.surroundContents(highlight);
            break;
        }
    }
};

// 清除高亮
const clearHighlight = () => {
    const highlights = document.querySelectorAll('.quote-card-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        while (highlight.firstChild) {
            parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight);
    });
};
