import { test as base, chromium } from '@playwright/test';
import path from 'path';

// 扩展测试上下文
export const test = base.extend({
    context: async ({ }, use) => {
        const pathToExtension = path.join(__dirname, '../../../dist');
        const context = await chromium.launchPersistentContext('', {
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ]
        });
        await use(context);
        await context.close();
    },
    extensionId: async ({ context }, use) => {
        let [background] = context.backgroundPages();
        if (!background)
            background = await context.waitForEvent('backgroundpage');

        const extensionId = background.url().split('/')[2];
        await use(extensionId);
    }
});

// 常用操作
export const commonActions = {
    // 选择文本
    async selectText(page, text) {
        await page.evaluate((text) => {
            const element = Array.from(document.querySelectorAll('*'))
                .find(el => el.textContent.includes(text));
            if (element) {
                const range = document.createRange();
                range.selectNodeContents(element);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }, text);
    },

    // 打开扩展弹窗
    async openPopup(context, extensionId) {
        const page = await context.newPage();
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        return page;
    },

    // 打开设置页面
    async openOptions(context, extensionId) {
        const page = await context.newPage();
        await page.goto(`chrome-extension://${extensionId}/options.html`);
        return page;
    },

    // 等待存储同步
    async waitForStorage(context) {
        const background = context.backgroundPages()[0];
        await background.waitForFunction(() => {
            return chrome.storage.local.get().then(data => {
                return Object.keys(data).length > 0;
            });
        });
    }
};

// 测试数据
export const testData = {
    sampleText: '这是一段测试文本，用于生成金句卡片。',
    sampleStyle: {
        background: {
            type: 'solid',
            color: '#ffffff'
        },
        font: {
            family: 'Arial',
            size: '16px',
            color: '#000000'
        }
    }
};
