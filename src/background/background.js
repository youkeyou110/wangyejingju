import { initializeMessageHandlers } from './messageHandlers';
import { setupContextMenus } from './contextMenus';
import { setupStorageListeners } from './storageListeners';
import logManager from '../managers/LogManager';
import stateManager from '../managers/StateManager';

// 初始化后台脚本
const initialize = async () => {
    try {
        // 初始化消息处理器
        initializeMessageHandlers();

        // 设置右键菜单
        setupContextMenus();

        // 设置存储监听器
        setupStorageListeners();

        // 初始化状态
        await stateManager.initialize();

        // 记录初始化成功
        logManager.info('Background script initialized successfully');
    } catch (error) {
        logManager.error('Background script initialization failed:', error);
    }
};

// 监听安装事件
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    try {
        if (reason === 'install') {
            // 首次安装
            await stateManager.performFirstTimeSetup();
            logManager.info('Extension installed successfully');
        } else if (reason === 'update') {
            // 更新安装
            await stateManager.performUpdate();
            logManager.info('Extension updated successfully');
        }
    } catch (error) {
        logManager.error('Installation handling failed:', error);
    }
});

// 监听卸载事件
chrome.runtime.onSuspend.addListener(() => {
    try {
        // 清理资源
        stateManager.cleanup();
        logManager.info('Extension cleanup completed');
    } catch (error) {
        logManager.error('Cleanup failed:', error);
    }
});

// 初始化
initialize();
