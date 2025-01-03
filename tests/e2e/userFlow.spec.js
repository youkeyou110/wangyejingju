import { test, expect } from '@playwright/test';
import { commonActions, testData } from './utils/testUtils';

test.describe('用户流程测试', () => {
    test('完整卡片生成流程', async ({ context, extensionId, page }) => {
        // 打开测试页面
        await page.goto('https://example.com');
        await page.setContent(`<div>${testData.sampleText}</div>`);

        // 选择文本
        await commonActions.selectText(page, testData.sampleText);

        // 右键点击
        await page.mouse.click(100, 100, { button: 'right' });
        await page.getByText('生成金句卡片').click();

        // 等待弹窗打开
        const popup = await commonActions.openPopup(context, extensionId);
        await expect(popup.getByText(testData.sampleText)).toBeVisible();

        // 编辑样式
        await popup.getByLabel('背景颜色').click();
        await popup.keyboard.type('#ff0000');
        await popup.getByLabel('字体').selectOption('Arial');
        await popup.getByLabel('字号').fill('24');

        // 预览检查
        const preview = popup.locator('.preview-content');
        await expect(preview).toHaveCSS('background-color', 'rgb(255, 0, 0)');
        await expect(preview).toHaveCSS('font-family', 'Arial');
        await expect(preview).toHaveCSS('font-size', '24px');

        // 导出卡片
        await popup.getByText('导出').click();
        const downloadPromise = page.waitForEvent('download');
        await popup.getByText('PNG').click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.png$/);

        // 检查历史记录
        await popup.getByText('历史').click();
        await expect(popup.getByText(testData.sampleText).first()).toBeVisible();
    });

    test('设置同步测试', async ({ context, extensionId }) => {
        // 打开设置页面
        const options = await commonActions.openOptions(context, extensionId);

        // 修改设置
        await options.getByLabel('暗色主题').check();
        await options.getByLabel('自动保存').check();
        await options.getByText('保存设置').click();

        // 打开新标签页
        const newPage = await context.newPage();
        await newPage.goto('https://example.com');

        // 检查设置是否同步
        const popup = await commonActions.openPopup(context, extensionId);
        await expect(popup.locator('body')).toHaveClass(/dark/);

        // 等待存储同步
        await commonActions.waitForStorage(context);
    });
});
