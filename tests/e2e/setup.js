const puppeteer = require('puppeteer');
const path = require('path');

const extensionPath = path.join(__dirname, '../../dist');

const setup = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Chrome扩展需要非无头模式
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox'
    ]
  });

  const targets = await browser.targets();
  const extensionTarget = targets.find(target => 
    target.type() === 'service_worker' && 
    target.url().includes(browser.browserContexts()[0].id)
  );
  const extensionUrl = extensionTarget.url();
  const [,, extensionID] = extensionUrl.split('/');

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(`chrome-extension://${extensionID}`, [
    'clipboardRead',
    'clipboardWrite'
  ]);

  return { browser, extensionID };
};

module.exports = setup; 