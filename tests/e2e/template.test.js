import { expect } from 'chai';
import puppeteer from 'puppeteer';

describe('Template Editor E2E Tests', () => {
    let browser;
    let page;

    before(async () => {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
    });

    after(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto('chrome-extension://[extension-id]/popup.html');
    });

    afterEach(async () => {
        await page.close();
    });

    it('should create new template', async () => {
        // 点击新建模板按钮
        await page.click('#new-template-btn');

        // 输入模板名称
        await page.type('#template-name', 'Test Template');

        // 输入模板内容
        await page.type('#template-content', 'Hello, World!');

        // 保存模板
        await page.click('#save-template-btn');

        // 验证模板列表中包含新模板
        const templateName = await page.$eval(
            '.template-item:last-child .template-name',
            el => el.textContent
        );
        expect(templateName).to.equal('Test Template');
    });

    it('should edit template', async () => {
        // 点击编辑按钮
        await page.click('.template-item:first-child .edit-btn');

        // 修改模板内容
        await page.evaluate(() => {
            document.querySelector('#template-content').value = 'Updated content';
        });

        // 保存修改
        await page.click('#save-template-btn');

        // 验证内容已更新
        const content = await page.$eval(
            '.template-item:first-child .template-preview',
            el => el.textContent
        );
        expect(content).to.include('Updated content');
    });

    it('should delete template', async () => {
        // 获取初始模板数量
        const initialCount = await page.$$eval('.template-item', items => items.length);

        // 点击删除按钮
        await page.click('.template-item:first-child .delete-btn');

        // 确认删除
        await page.click('#confirm-delete-btn');

        // 验证模板数量减少
        const finalCount = await page.$$eval('.template-item', items => items.length);
        expect(finalCount).to.equal(initialCount - 1);
    });
});
