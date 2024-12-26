import { i18n } from '@/i18n';

describe('I18n', () => {
  beforeEach(() => {
    // 清除所有模拟调用记录
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
    chrome.i18n.getUILanguage.mockClear();
    chrome.i18n.getMessage.mockClear();

    // 重置 DOM
    document.body.innerHTML = `
      <div data-i18n="test.key">原文本</div>
      <input data-i18n-placeholder="input.placeholder" />
      <button data-i18n-title="button.title">按钮</button>
    `;
  });

  describe('getCurrentLocale', () => {
    it('should return correct locale for Chinese', () => {
      chrome.i18n.getUILanguage.mockReturnValue('zh-CN');
      expect(i18n.getCurrentLocale()).toBe('zh_CN');
    });

    it('should return correct locale for Japanese', () => {
      chrome.i18n.getUILanguage.mockReturnValue('ja');
      expect(i18n.getCurrentLocale()).toBe('ja');
    });

    it('should return default locale for unsupported language', () => {
      chrome.i18n.getUILanguage.mockReturnValue('fr');
      expect(i18n.getCurrentLocale()).toBe('en');
    });
  });

  describe('getMessage', () => {
    it('should return translated message', () => {
      chrome.i18n.getMessage.mockReturnValue('翻译文本');
      expect(i18n.getMessage('test.key')).toBe('翻译文本');
    });

    it('should return key if translation not found', () => {
      chrome.i18n.getMessage.mockReturnValue('');
      expect(i18n.getMessage('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should handle substitutions', () => {
      chrome.i18n.getMessage.mockReturnValue('Hello, $1!');
      expect(i18n.getMessage('greeting', ['World'])).toBe('Hello, World!');
    });
  });

  describe('updatePageTranslations', () => {
    beforeEach(() => {
      chrome.i18n.getMessage.mockImplementation(key => `translated_${key}`);
    });

    it('should update text content for data-i18n elements', () => {
      i18n.updatePageTranslations();
      const element = document.querySelector('[data-i18n="test.key"]');
      expect(element.textContent).toBe('translated_test.key');
    });

    it('should update placeholder for data-i18n-placeholder elements', () => {
      i18n.updatePageTranslations();
      const input = document.querySelector('[data-i18n-placeholder]');
      expect(input.placeholder).toBe('translated_input.placeholder');
    });

    it('should update title for data-i18n-title elements', () => {
      i18n.updatePageTranslations();
      const button = document.querySelector('[data-i18n-title]');
      expect(button.title).toBe('translated_button.title');
    });
  });

  describe('changeLocale', () => {
    it('should change locale and update storage', async () => {
      await i18n.changeLocale('ja');
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        userLocale: 'ja'
      });
    });

    it('should not change locale for unsupported language', async () => {
      await i18n.changeLocale('fr');
      
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
      expect(i18n.currentLocale).not.toBe('fr');
    });

    it('should trigger localeChanged event', async () => {
      const eventHandler = jest.fn();
      window.addEventListener('localeChanged', eventHandler);

      await i18n.changeLocale('en');
      
      expect(eventHandler).toHaveBeenCalled();
      const event = eventHandler.mock.calls[0][0];
      expect(event.detail.locale).toBe('en');
    });
  });

  describe('init', () => {
    it('should load saved locale from storage', async () => {
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ userLocale: 'ja' });
      });

      await i18n.init();
      expect(i18n.currentLocale).toBe('ja');
    });

    it('should use browser locale if no saved preference', async () => {
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({});
      });
      chrome.i18n.getUILanguage.mockReturnValue('zh-CN');

      await i18n.init();
      expect(i18n.currentLocale).toBe('zh_CN');
    });

    it('should update page translations after initialization', async () => {
      const spy = jest.spyOn(i18n, 'updatePageTranslations');
      
      await i18n.init();
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });
}); 