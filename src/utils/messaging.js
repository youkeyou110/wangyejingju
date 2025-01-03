import logManager from '../managers/LogManager';

// 发送消息
export const sendMessage = async (type, data = {}) => {
    try {
        const response = await chrome.runtime.sendMessage({
            type,
            data
        });

        if (!response.success) {
            throw new Error(response.error || 'Message failed');
        }

        return response.data;
    } catch (error) {
        logManager.error('Message sending failed:', error);
        throw error;
    }
};

// 发送消息到标签页
export const sendMessageToTab = async (tabId, type, data = {}) => {
    try {
        const response = await chrome.tabs.sendMessage(tabId, {
            type,
            data
        });

        if (!response.success) {
            throw new Error(response.error || 'Message failed');
        }

        return response.data;
    } catch (error) {
        logManager.error('Tab message sending failed:', error);
        throw error;
    }
};

// 广播消息到所有标签页
export const broadcastMessage = async (type, data = {}) => {
    try {
        const tabs = await chrome.tabs.query({});
        const responses = await Promise.all(
            tabs.map(tab => sendMessageToTab(tab.id, type, data))
        );
        return responses;
    } catch (error) {
        logManager.error('Message broadcasting failed:', error);
        throw error;
    }
};

// 注册消息处理器
export const registerMessageHandler = (type, handler) => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === type) {
            try {
                const response = handler(message.data, sender);
                if (response instanceof Promise) {
                    response
                        .then(data => sendResponse({ success: true, data }))
                        .catch(error => {
                            logManager.error('Message handling failed:', error);
                            sendResponse({
                                success: false,
                                error: error.message
                            });
                        });
                    return true; // 保持消息通道开放
                } else {
                    sendResponse({ success: true, data: response });
                }
            } catch (error) {
                logManager.error('Message handling failed:', error);
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
        }
        return false;
    });
};

// 创建消息处理器
export const createMessageHandler = (handlers) => {
    return (message, sender, sendResponse) => {
        const handler = handlers[message.type];
        if (!handler) {
            sendResponse({
                success: false,
                error: 'Unknown message type'
            });
            return;
        }

        try {
            const response = handler(message.data, sender);
            if (response instanceof Promise) {
                response
                    .then(data => sendResponse({ success: true, data }))
                    .catch(error => {
                        logManager.error('Message handling failed:', error);
                        sendResponse({
                            success: false,
                            error: error.message
                        });
                    });
                return true; // 保持消息通道开放
            } else {
                sendResponse({ success: true, data: response });
            }
        } catch (error) {
            logManager.error('Message handling failed:', error);
            sendResponse({
                success: false,
                error: error.message
            });
        }
    };
};
