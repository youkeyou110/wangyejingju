import { MESSAGE_TYPES, MESSAGE_STATUS } from '../types/messages';

class ContentManager {
    constructor() {
        this.textSelector = null;
        this.init();
    }

    init() {
        // 初始化文本选择器
        this.textSelector = new TextSelector();

        // 监听来自Background的消息
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

        // 监听文本选择事件
        document.addEventListener('mouseup', this.handleSelection.bind(this));

        // 监听快捷键
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // 处理文本选择
    handleSelection(event) {
        const text = window.getSelection().toString().trim();
        if (text) {
            this.sendMessage({
                type: MESSAGE_TYPES.TEXT_SELECTED,
                data: { text }
            });
        }
    }

    // 处理快捷键
    handleKeydown(event) {
        // Ctrl/Cmd + Shift + Q
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Q') {
            const text = window.getSelection().toString().trim();
            if (text) {
                this.sendMessage({
                    type: MESSAGE_TYPES.TEXT_SELECTED,
                    data: { text }
                });
            }
        }
    }

    // 发送消息到Background
    async sendMessage(message) {
        try {
            const response = await chrome.runtime.sendMessage(message);
            if (response?.status === MESSAGE_STATUS.ERROR) {
                throw new Error(response.error);
            }
            return response;
        } catch (error) {
            console.error('Failed to send message:', error);
            this.handleError(error);
        }
    }

    // 处理接收到的消息
    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case MESSAGE_TYPES.TEXT_SELECTED:
                this.textSelector.highlightSelection(message.data.text);
                sendResponse({ status: MESSAGE_STATUS.SUCCESS });
                break;

            case MESSAGE_TYPES.CLEAR_SELECTION:
                this.textSelector.clearHighlight();
                sendResponse({ status: MESSAGE_STATUS.SUCCESS });
                break;

            case MESSAGE_TYPES.ERROR_OCCURRED:
                this.handleError(new Error(message.error));
                break;

            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    // 错误处理
    handleError(error) {
        console.error('Error in content script:', error);
        this.sendMessage({
            type: MESSAGE_TYPES.ERROR_OCCURRED,
            error: error.message
        });
    }
}

// 初始化内容管理器
const contentManager = new ContentManager();
