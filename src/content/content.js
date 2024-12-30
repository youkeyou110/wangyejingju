// 内容脚本
(() => {
    // 初始化
    function initialize() {
        // 添加必要的样式
        injectStyles();
        // 注册消息监听
        setupMessageListeners();
        // 初始化功能
        initializeFeatures();
    }

    // 注入样式
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .quote-card-highlight {
                background-color: rgba(74, 144, 226, 0.1);
                border-bottom: 2px solid #4a90e2;
            }
            .quote-card-tooltip {
                position: fixed;
                z-index: 10000;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                padding: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    // 设置消息监听
    function setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.type) {
                case 'getSelection':
                    sendResponse({ text: window.getSelection().toString() });
                    break;
                case 'highlight':
                    highlightText(request.text);
                    sendResponse({ success: true });
                    break;
            }
        });
    }

    // 初始化功能
    function initializeFeatures() {
        // 添加选中文本处理
        document.addEventListener('mouseup', handleTextSelection);
    }

    // 处理文本选中
    function handleTextSelection(e) {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            showQuoteToolbar(e, text);
        } else {
            hideQuoteToolbar();
        }
    }

    // 显示引用工具栏
    function showQuoteToolbar(e, text) {
        let toolbar = document.querySelector('.quote-card-tooltip');
        if (!toolbar) {
            toolbar = createToolbar();
        }

        const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        positionToolbar(toolbar, rect);

        // 更新工具栏内容
        toolbar.querySelector('.quote-text').textContent = text;
    }

    // 创建工具栏
    function createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'quote-card-tooltip';
        toolbar.innerHTML = `
            <div class="quote-text"></div>
            <div class="quote-actions">
                <button class="create-card">生成卡片</button>
                <button class="copy-text">复制文本</button>
            </div>
        `;

        // 添加事件监听
        toolbar.querySelector('.create-card').addEventListener('click', () => {
            const text = toolbar.querySelector('.quote-text').textContent;
            chrome.runtime.sendMessage({
                type: 'createCard',
                text: text
            });
        });

        toolbar.querySelector('.copy-text').addEventListener('click', () => {
            const text = toolbar.querySelector('.quote-text').textContent;
            navigator.clipboard.writeText(text).then(() => {
                showNotification('已复制到剪贴板');
            });
        });

        document.body.appendChild(toolbar);
        return toolbar;
    }

    // 定位工具栏
    function positionToolbar(toolbar, rect) {
        const toolbarRect = toolbar.getBoundingClientRect();
        let top = rect.bottom + window.scrollY + 10;
        let left = rect.left + window.scrollX;

        // 确保工具栏不会超出视口
        if (top + toolbarRect.height > window.innerHeight) {
            top = rect.top + window.scrollY - toolbarRect.height - 10;
        }
        if (left + toolbarRect.width > window.innerWidth) {
            left = window.innerWidth - toolbarRect.width - 10;
        }

        toolbar.style.top = `${top}px`;
        toolbar.style.left = `${left}px`;
    }

    // 隐藏工具栏
    function hideQuoteToolbar() {
        const toolbar = document.querySelector('.quote-card-tooltip');
        if (toolbar) {
            toolbar.remove();
        }
    }

    // 高亮文本
    function highlightText(text) {
        const range = window.getSelection().getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'quote-card-highlight';
        range.surroundContents(span);
    }

    // 显示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'quote-card-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // 初始化
    initialize();
})();
