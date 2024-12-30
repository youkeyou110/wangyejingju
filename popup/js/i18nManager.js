class I18nManager {
    constructor(storageManager, uiManager, errorHandler) {
        this.storageManager = storageManager;
        this.uiManager = uiManager;
        this.errorHandler = errorHandler;
        this.messages = new Map();
        this.currentLocale = '';
        this.fallbackLocale = 'en';
        this.initialized = false;
    }

    async initialize() {
        try {
            // 加载当前语言设置
            const savedLocale = await this.storageManager.getData('locale');
            this.currentLocale = savedLocale || chrome.i18n.getUILanguage() || this.fallbackLocale;

            // 加载语言包
            await this.loadMessages(this.currentLocale);

            // 应用翻译
            this.translatePage();

            // 绑定事件监听
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'i18nInitialize');
        }
    }

    // 语言管理
    async setLocale(locale) {
        try {
            // 加载新语言包
            await this.loadMessages(locale);

            // 保存语言设置
            await this.storageManager.saveData('locale', locale);

            // 更新当前语言
            this.currentLocale = locale;

            // 重新翻译页面
            this.translatePage();

            // 触发语言变更事件
            document.dispatchEvent(new CustomEvent('localeChanged', {
                detail: { locale }
            }));

            // 更新UI
            this.uiManager.showNotification(this.getMessage('languageChanged'), 'success');

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'setLocale');
            this.uiManager.showNotification(this.getMessage('languageChangeFailed'), 'error');
            return false;
        }
    }

    getMessage(key, substitutions = []) {
        try {
            // 获取消息模板
            const message = this.messages.get(key) || chrome.i18n.getMessage(key, substitutions);

            if (!message) {
                // 尝试从备用语言获取
                if (this.currentLocale !== this.fallbackLocale) {
                    return this.getFallbackMessage(key, substitutions);
                }
                return key;
            }

            // 替换变量
            return this.processMessage(message, substitutions);
        } catch (error) {
            this.errorHandler.handleError(error, 'getMessage');
            return key;
        }
    }

    // 页面翻译
    translatePage() {
        try {
            // 翻译所有带有 data-i18n 属性的元素
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.dataset.i18n;
                const message = this.getMessage(key);

                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = message;
                } else {
                    element.textContent = message;
                }
            });

            // 翻译所有带有 data-i18n-attr 属性的元素
            document.querySelectorAll('[data-i18n-attr]').forEach(element => {
                const attrs = element.dataset.i18nAttr.split(';');
                attrs.forEach(attr => {
                    const [attrName, key] = attr.split(':');
                    if (attrName && key) {
                        element.setAttribute(attrName, this.getMessage(key));
                    }
                });
            });

            // 触发翻译完成事件
            document.dispatchEvent(new CustomEvent('translationCompleted', {
                detail: { locale: this.currentLocale }
            }));
        } catch (error) {
            this.errorHandler.handleError(error, 'translatePage');
        }
    }

    // 私有方法
    private async loadMessages(locale) {
        try {
            // 加载语言包
            const response = await fetch(`_locales/${locale}/messages.json`);
            if (!response.ok) {
                throw new Error(`Failed to load messages for locale: ${locale}`);
            }

            const messages = await response.json();

            // 处理消息
            this.messages.clear();
            Object.entries(messages).forEach(([key, value]) => {
                this.messages.set(key, value.message);
            });

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'loadMessages');
            throw error;
        }
    }

    private getFallbackMessage(key, substitutions) {
        try {
            return chrome.i18n.getMessage(key, substitutions) || key;
        } catch (error) {
            this.errorHandler.handleError(error, 'getFallbackMessage');
            return key;
        }
    }

    private processMessage(message, substitutions) {
        try {
            return substitutions.reduce((msg, sub, index) => {
                return msg.replace(new RegExp(`\\$${index + 1}`, 'g'), sub);
            }, message);
        } catch (error) {
            this.errorHandler.handleError(error, 'processMessage');
            return message;
        }
    }

    private setupEventListeners() {
        // 监听语言切换
        document.addEventListener('languageChange', async (e) => {
            const { locale } = e.detail;
            await this.setLocale(locale);
        });

        // 监听动态内容加载
        document.addEventListener('contentLoaded', () => {
            this.translatePage();
        });

        // 监听路由变化
        window.addEventListener('popstate', () => {
            this.translatePage();
        });
    }
}

export default I18nManager;
