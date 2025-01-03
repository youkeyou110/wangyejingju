import { test, expect } from '@playwright/test';
import { commonActions, testData } from './utils/testUtils';

test.describe('跨页面交互测试', () => {
    test('多标签页数据同步', async ({ context, extensionId }) => {
        // 打开两个标签页
        const page1 = await context.newPage();
        const page2 = await context.newPage();

        await page1.goto('https://example.com');
        await page2.goto('https://example.com');

        // 在第一个标签页生成卡片
        await page1.setContent(`<div>${testData.sampleText}</div>`);
        await commonActions.selectText(page1, testData.sampleText);
        await page1.mouse.click(100, 100, { button: 'right' });
        await page1.getByText('生成金句卡片').click();

        // 在第二个标签页检查
        const popup2 = await commonActions.openPopup(context, extensionId);
        await popup2.getByText('历史').click();
        await expect(popup2.getByText(testData.sampleText)).toBeVisible();
    });

    test('设置页面与弹窗交互', async ({ context, extensionId }) => {
        // 打开设置页面
        const options = await commonActions.openOptions(context, extensionId);

        // 创建自定义模板
        await options.getByText('模板管理').click();
        await options.getByText('新建模板').click();
        await options.getByLabel('模板名称').fill('测试模板');
        await options.getByText('保存模板').click();

        // 在弹窗中使用模板
        const popup = await commonActions.openPopup(context, extensionId);
        await popup.getByText('模板').click();
        await expect(popup.getByText('测试模板')).toBeVisible();
    });

    test('通知系统测试', async ({ context, extensionId }) => {
        // 模拟存储超限
        const background = context.backgroundPages()[0];
        await background.evaluate(() => {
            // 填充存储直到超限
            const largeData = new Array(1000000).fill('test').join('');
            return new Promise(resolve => {
                chrome.storage.local.set({ test: largeData }, () => {
                    if (chrome.runtime.lastError) {
                        resolve(chrome.runtime.lastError.message);
                    }
                    resolve(null);
                });
            });
        });

        // 检查通知
        const notifications = await context.evaluate(() => {
            return new Promise(resolve => {
                chrome.notifications.getAll(resolve);
            });
        });

        expect(Object.keys(notifications)).toHaveLength(1);
        expect(notifications[0].type).toBe('basic');
        expect(notifications[0].title).toContain('存储空间不足');
    });
});
