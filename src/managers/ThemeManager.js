import { EventEmitter } from 'events';
import logManager from './LogManager';
import { generateThemeVariables } from '../utils/themeUtils';

class ThemeManager extends EventEmitter {
    constructor() {
        super();
        this.themes = new Map();
        this.currentTheme = null;
        this.variables = new Map();
        this.customizations = new Map();
        this.setupDefaultThemes();
    }

    // 注册主题
    register(theme) {
        try {
            const { name, version } = theme;
            const themeKey = `${name}@${version}`;

            if (this.themes.has(themeKey)) {
                throw new Error(`Theme ${themeKey} already exists`);
            }

            // 生成主题变量
            const variables = generateThemeVariables(theme);

            // 存储主题
            this.themes.set(themeKey, {
                ...theme,
                variables,
                status: 'registered'
            });

            // 触发事件
            this.emit('theme:register', {
                key: themeKey,
                theme
            });

            return true;
        } catch (error) {
            logManager.error('Theme registration failed:', error);
            throw error;
        }
    }

    // 应用主题
    async apply(themeKey, options = {}) {
        try {
            const theme = this.themes.get(themeKey);
            if (!theme) {
                throw new Error(`Theme ${themeKey} not found`);
            }

            // 获取自定义设置
            const customization = this.customizations.get(themeKey) || {};

            // 合并变量
            const variables = {
                ...theme.variables,
                ...customization,
                ...options
            };

            // 更新DOM
            this.updateThemeVariables(variables);

            // 更新状态
            this.currentTheme = themeKey;
            theme.status = 'active';

            // 触发事件
            this.emit('theme:apply', {
                key: themeKey,
                variables
            });

            return true;
        } catch (error) {
            logManager.error('Theme application failed:', error);
            throw error;
        }
    }

    // 自定义主题
    customize(themeKey, customization) {
        try {
            const theme = this.themes.get(themeKey);
            if (!theme) {
                throw new Error(`Theme ${themeKey} not found`);
            }

            // 存储自定义设置
            this.customizations.set(themeKey, {
                ...this.customizations.get(themeKey),
                ...customization
            });

            // 如果是当前主题，立即应用
            if (this.currentTheme === themeKey) {
                this.apply(themeKey);
            }

            // 触发事件
            this.emit('theme:customize', {
                key: themeKey,
                customization
            });

            return true;
        } catch (error) {
            logManager.error('Theme customization failed:', error);
            throw error;
        }
    }

    // 导出主题
    export(themeKey) {
        try {
            const theme = this.themes.get(themeKey);
            if (!theme) {
                throw new Error(`Theme ${themeKey} not found`);
            }

            const customization = this.customizations.get(themeKey) || {};

            return {
                ...theme,
                customization
            };
        } catch (error) {
            logManager.error('Theme export failed:', error);
            throw error;
        }
    }

    // 导入主题
    import(themeData) {
        try {
            const { name, version, customization, ...theme } = themeData;
            const themeKey = `${name}@${version}`;

            // 注册主题
            this.register({
                name,
                version,
                ...theme
            });

            // 应用自定义设置
            if (customization) {
                this.customize(themeKey, customization);
            }

            return themeKey;
        } catch (error) {
            logManager.error('Theme import failed:', error);
            throw error;
        }
    }

    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme ? {
            key: this.currentTheme,
            theme: this.themes.get(this.currentTheme)
        } : null;
    }

    // 获取所有主题
    getAllThemes() {
        return Array.from(this.themes.entries()).map(([key, theme]) => ({
            key,
            theme
        }));
    }

    // 内部方法：更新主题变量
    updateThemeVariables(variables) {
        const root = document.documentElement;
        const style = document.getElementById('theme-variables') ||
            document.createElement('style');

        if (!style.id) {
            style.id = 'theme-variables';
            document.head.appendChild(style);
        }

        const cssVariables = Object.entries(variables)
            .map(([key, value]) => `--${key}: ${value};`)
            .join('\n');

        style.textContent = `:root {\n${cssVariables}\n}`;

        // 更新变量缓存
        this.variables = new Map(Object.entries(variables));
    }

    // 内部方法：设置默认主题
    setupDefaultThemes() {
        // 亮色主题
        this.register({
            name: 'light',
            version: '1.0.0',
            colors: {
                primary: '#1890ff',
                secondary: '#666666',
                background: '#ffffff',
                text: '#000000',
                border: '#d9d9d9'
            },
            typography: {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
            },
            spacing: {
                small: '8px',
                medium: '16px',
                large: '24px'
            },
            animation: {
                duration: '0.3s',
                timing: 'ease-in-out'
            }
        });

        // 暗色主题
        this.register({
            name: 'dark',
            version: '1.0.0',
            colors: {
                primary: '#1890ff',
                secondary: '#999999',
                background: '#1f1f1f',
                text: '#ffffff',
                border: '#434343'
            },
            typography: {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
            },
            spacing: {
                small: '8px',
                medium: '16px',
                large: '24px'
            },
            animation: {
                duration: '0.3s',
                timing: 'ease-in-out'
            }
        });
    }
}

export default new ThemeManager();
