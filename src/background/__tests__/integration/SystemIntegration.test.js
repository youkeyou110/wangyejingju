import { mockChromeAPI, waitForAsync } from '../../../utils/testUtils';
import '../../../background/background';
import storageManager from '../../../managers/StorageManager';

describe('系统集成测试', () => {
    let chrome;

    beforeEach(() => {
        chrome = mockChromeAPI();
        storageManager.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Chrome API集成', () => {
        test('右键菜单应该正确创建和响应', async () => {
            // 模拟右键菜单点击
            const menuClickEvent = {
                menuItemId: 'createCard',
                selectionText: 'test text'
            };

            // 触发菜单点击
            chrome.contextMenus.onClicked.dispatch(menuClickEvent);

            // 检查消息发送
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
                expect.any(Number),
                expect.objectContaining({
                    type: 'CREATE_CARD',
                    text: 'test text'
                })
            );
        });

        test('扩展安装应该初始化必要数据', async () => {
            // 模拟扩展安装
            chrome.runtime.onInstalled.dispatch({ reason: 'install' });

            // 检查初始化数据
            const settings = await storageManager.get('settings');
            expect(settings).toBeTruthy();
            expect(settings.version).toBe('1.0.0');
        });
    });

    describe('消息通信', () => {
        test('内容脚本应该能与后台脚本通信', async () => {
            // 模拟内容脚本消息
            const message = {
                type: 'SAVE_CARD',
                data: { text: 'test', style: {} }
            };

            // 发送消息
            chrome.runtime.onMessage.dispatch(message, {
                tab: { id: 1 }
            });

            // 检查存储
            const cards = await storageManager.get('cards');
            expect(cards).toContainEqual(expect.objectContaining({
                text: 'test'
            }));
        });

        test('后台脚本应该能响应存储变化', async () => {
            // 监听存储变化
            const changes = {};
            chrome.storage.onChanged.addListener((changes, area) => {
                changes[area] = changes;
            });

            // 更改存储
            await storageManager.set('test', 'value');

            // 检查响应
            expect(changes.local).toBeTruthy();
            expect(changes.local.test.newValue).toBe('value');
        });
    });

    describe('数据同步', () => {
        test('设置应该在不同标签页间同步', async () => {
            // 模拟多个标签页
            const tabs = [
                { id: 1, url: 'http://example.com' },
                { id: 2, url: 'http://example.com' }
            ];
            chrome.tabs.query.mockResolvedValue(tabs);

            // 更改设置
            await storageManager.set('settings', { theme: 'dark' });

            // 检查消息广播
            expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2);
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    type: 'SETTINGS_CHANGED',
                    settings: { theme: 'dark' }
                })
            );
        });
    });

    describe('错误处理', () => {
        test('应该处理存储配额超限', async () => {
            // 模拟存储配额超限
            chrome.storage.local.setItem.mockRejectedValueOnce(
                new Error('QUOTA_EXCEEDED')
            );

            // 尝试存储大量数据
            const result = await storageManager.set(
                'large',
                Array(1000000).fill('test').join('')
            );

            // 检查错误处理
            expect(result).toBe(false);
            expect(chrome.notifications.create).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    type: 'basic',
                    title: '存储空间不足',
                    message: expect.any(String)
                })
            );
        });

        test('应该处理消息发送失败', async () => {
            // 模拟消息发送失败
            chrome.tabs.sendMessage.mockRejectedValueOnce(
                new Error('Could not establish connection')
            );

            // 发送消息
            const message = { type: 'TEST' };
            await chrome.runtime.sendMessage(message);

            // 检查错误处理
            expect(chrome.notifications.create).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    type: 'basic',
                    title: '通信错误',
                    message: expect.any(String)
                })
            );
        });
    });
});
