const setup = require('./setup');
const { expect } = require('chai');

describe('Quote Card Generator E2E Tests', () => {
  let browser;
  let extensionID;
  let page;

  before(async () => {
    ({ browser, extensionID } = await setup());
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/popup/popup.html`);
  });

  afterEach(async () => {
    await page.close();
  });

  after(async () => {
    await browser.close();
  });

  describe('Basic Functionality', () => {
    it('should load popup page correctly', async () => {
      const title = await page.$eval('h1', el => el.textContent);
      expect(title).to.include('金句卡片生成器');
    });

    it('should handle text input', async () => {
      const testText = '测试文本';
      await page.type('#textInput', testText);
      const previewText = await page.$eval('#cardPreview', el => el.textContent);
      expect(previewText).to.equal(testText);
    });

    it('should switch templates', async () => {
      const templateCards = await page.$$('.template-card');
      await templateCards[1].click();
      const isSelected = await page.$eval('.template-card:nth-child(2)', 
        el => el.classList.contains('selected')
      );
      expect(isSelected).to.be.true;
    });
  });

  describe('Style Editor', () => {
    it('should update background color', async () => {
      const testColor = '#ff0000';
      await page.evaluate((color) => {
        document.getElementById('bgColorPicker').value = color;
        document.getElementById('bgColorPicker').dispatchEvent(new Event('input'));
      }, testColor);

      const backgroundColor = await page.$eval('#cardPreview', 
        el => window.getComputedStyle(el).backgroundColor
      );
      expect(backgroundColor).to.equal('rgb(255, 0, 0)');
    });

    it('should update font settings', async () => {
      const testSize = '24';
      await page.type('#fontSize', testSize);
      await page.keyboard.press('Enter');

      const fontSize = await page.$eval('#cardPreview', 
        el => window.getComputedStyle(el).fontSize
      );
      expect(fontSize).to.equal('24px');
    });
  });

  describe('Export Functionality', () => {
    it('should open export dialog', async () => {
      await page.click('#exportBtn');
      const dialogVisible = await page.$eval('#exportDialog', 
        el => window.getComputedStyle(el).display !== 'none'
      );
      expect(dialogVisible).to.be.true;
    });

    it('should handle export settings', async () => {
      await page.click('#exportBtn');
      await page.select('#exportFormat', 'png');
      await page.evaluate(() => {
        document.getElementById('exportQuality').value = '90';
      });
      
      const format = await page.$eval('#exportFormat', el => el.value);
      const quality = await page.$eval('#exportQuality', el => el.value);
      
      expect(format).to.equal('png');
      expect(quality).to.equal('90');
    });
  });

  describe('Internationalization', () => {
    it('should switch languages', async () => {
      await page.select('#languageSelect', 'en');
      const buttonText = await page.$eval('#exportBtn', el => el.textContent);
      expect(buttonText).to.equal('Export Image');
    });

    it('should persist language preference', async () => {
      await page.select('#languageSelect', 'en');
      await page.reload();
      const language = await page.$eval('#languageSelect', el => el.value);
      expect(language).to.equal('en');
    });
  });

  describe('Error Handling', () => {
    it('should show error toast for invalid operations', async () => {
      // 模拟存储错误
      await page.evaluate(() => {
        chrome.storage.local.set = () => { throw new Error('Storage error'); };
      });

      await page.click('#saveTemplateBtn');
      const toastVisible = await page.$eval('.toast-error', 
        el => window.getComputedStyle(el).opacity !== '0'
      );
      expect(toastVisible).to.be.true;
    });

    it('should recover from errors gracefully', async () => {
      // 模拟临时错误
      await page.evaluate(() => {
        chrome.storage.local.get = (key, callback) => {
          callback({ error: 'Temporary error' });
        };
      });

      await page.reload();
      const templateList = await page.$('#templateList');
      expect(templateList).to.not.be.null;
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time', async () => {
      const startTime = Date.now();
      await page.reload();
      await page.waitForSelector('#cardPreview');
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.below(2000);
    });

    it('should handle rapid style updates efficiently', async () => {
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        await page.type('#fontSize', String(12 + i));
        await page.keyboard.press('Enter');
      }
      const updateTime = Date.now() - startTime;
      expect(updateTime).to.be.below(1000);
    });
  });
}); 