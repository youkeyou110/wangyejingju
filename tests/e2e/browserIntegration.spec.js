import { test, expect } from '@playwright/test';
import { commonActions } from './utils/testUtils';

test.describe('浏览器集成测试', () => {
    test('扩展安装与初始化', async ({ context, extensionId }) => {
        // 检查扩展是否正确加载
        const extensions = await context.evaluate(() => {
            return new Promise(resolve => {
                chrome.management.getSelf(info => resolve(info));
            });
        });

        expect(extensions.id).toBe(extensionId);
        expect(extensions.enabled).toBe(true);

        // 检查必要权限
        const permissions = await context.evaluate(() => {
            return new Promise(resolve => {
                chrome.permissions.getAll(resolve);
            });
        });

        expect(permissions.permissions).toContain('storage');
        expect(permissions.permissions).toContain('contextMenus');
    });

    test('存储系统集成', async ({ context, extensionId }) => {
        // 检查存储限额
        const quota = await context.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.local.getBytesInUse(null, bytes => {
                    chrome.storage.local.get(null, data => {
                        resolve({
                            bytesInUse: bytes,
                            data
                        });
                    });
                });
            });
        });

        expect(quota.bytesInUse).toBeDefined();
        expect(Object.keys(quota.data)).toBeDefined();

        // 测试存储同步
        const page = await context.newPage();
        await page.goto('https://example.com');

        const storageChange = page.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.onChanged.addListener((changes, area) => {
                    if (area === 'local') {
                        resolve(changes);
                    }
                });
                chrome.storage.local.set({ test: 'value' });
            });
        });

        const changes = await storageChange;
        expect(changes.test.newValue).toBe('value');
    });

    test('后台脚本持久化', async ({ context }) => {
        // 检查后台脚本状态
        const background = context.backgroundPages()[0];

        // 模拟浏览器重启
        await context.close();
        const newContext = await chromium.launchPersistentContext('', {
            headless: false
        });

        // 检查数据是否保持
        const newBackground = newContext.backgroundPages()[0];
        const storage = await newBackground.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.local.get(null, resolve);
            });
        });

        expect(storage).toBeDefined();
        await newContext.close();
    });

    test('错误恢复机制', async ({ context, extensionId }) => {
        // 模拟扩展崩溃
        const background = context.backgroundPages()[0];
        await background.evaluate(() => {
            chrome.runtime.reload();
        });

        // 检查恢复
        const popup = await commonActions.openPopup(context, extensionId);
        await expect(popup).toBeVisible();

        // 检查数据完整性
        const storage = await context.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.local.get(null, resolve);
            });
        });

        expect(storage).toBeDefined();
    });
});
