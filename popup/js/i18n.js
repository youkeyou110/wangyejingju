class I18n {
  constructor() {
    this.defaultLocale = 'en';
    this.supportedLocales = ['en', 'zh_CN', 'ja'];
    this.currentLocale = this.getCurrentLocale();
  }

  getCurrentLocale() {
    // 获取浏览器语言
    const browserLocale = chrome.i18n.getUILanguage();
    
    // 转换为支持的语言代码
    let locale = this.defaultLocale;
    if (browserLocale.startsWith('zh')) {
      locale = 'zh_CN';
    } else if (browserLocale.startsWith('ja')) {
      locale = 'ja';
    }
    
    return locale;
  }

  // 获取翻译文本
  getMessage(key, substitutions = null) {
    return chrome.i18n.getMessage(key, substitutions) || key;
  }

  // 更新所有需要翻译的元素
  updatePageTranslations() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      element.textContent = this.getMessage(key);
    });

    // 更新所有带有 data-i18n-placeholder 属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      element.placeholder = this.getMessage(key);
    });

    // 更新所有带有 data-i18n-title 属性的元素
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.dataset.i18nTitle;
      element.title = this.getMessage(key);
    });
  }

  // 切换语言
  async changeLocale(locale) {
    if (this.supportedLocales.includes(locale)) {
      this.currentLocale = locale;
      // 保存用户语言偏好
      await chrome.storage.local.set({ userLocale: locale });
      // 更新页面文本
      this.updatePageTranslations();
      // 触发语言变更事件
      window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
    }
  }

  // 初始化
  async init() {
    // 获取保存的语言偏好
    const { userLocale } = await chrome.storage.local.get('userLocale');
    if (userLocale && this.supportedLocales.includes(userLocale)) {
      this.currentLocale = userLocale;
    }
    this.updatePageTranslations();
  }
}

// 导出单例实例
export const i18n = new I18n(); 