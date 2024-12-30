class ThemeManager {
    constructor(storageManager, uiManager, errorHandler) {
        this.storageManager = storageManager;
        this.uiManager = uiManager;
        this.errorHandler = errorHandler;
        this.currentTheme = null;
        this.themes = new Map();
        this.initialized = false;
    }

    async initialize() {
        try {
            // 注册默认主题
            this.registerDefaultThemes();

            // 加载用户主题
            await this.loadUserThemes();

            // 应用保存的主题
            const savedTheme = await this.storageManager.getData('currentTheme');
            if (savedTheme) {
                await this.applyTheme(savedTheme);
            } else {
                await this.applyTheme('light');
            }

            // 监听主题切换事件
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'themeInitialize');
        }
    }

    async applyTheme(themeId) {
        try {
            const theme = this.themes.get(themeId);
            if (!theme) {
                throw new Error(`Theme ${themeId} not found`);
            }

            // 应用主题变量
            Object.entries(theme.variables).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });

            // 切换主题类名
            document.body.classList.forEach(className => {
                if (className.startsWith('theme-')) {
                    document.body.classList.remove(className);
                }
            });
            document.body.classList.add(`theme-${themeId}`);

            // 保存当前主题
            this.currentTheme = themeId;
            await this.storageManager.saveData('currentTheme', themeId);

            // 触发主题变更事件
            document.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: themeId }
            }));

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'applyTheme');
            throw error;
        }
    }

    async createTheme(theme) {
        try {
            if (!this.validateTheme(theme)) {
                throw new Error('Invalid theme');
            }

            this.themes.set(theme.id, theme);
            await this.saveUserThemes();

            return theme;
        } catch (error) {
            this.errorHandler.handleError(error, 'createTheme');
            throw error;
        }
    }

    async updateTheme(themeId, updates) {
        try {
            const theme = this.themes.get(themeId);
            if (!theme) {
                throw new Error(`Theme ${themeId} not found`);
            }

            const updatedTheme = {
                ...theme,
                ...updates,
                variables: {
                    ...theme.variables,
                    ...updates.variables
                }
            };

            if (!this.validateTheme(updatedTheme)) {
                throw new Error('Invalid theme');
            }

            this.themes.set(themeId, updatedTheme);
            await this.saveUserThemes();

            if (this.currentTheme === themeId) {
                await this.applyTheme(themeId);
            }

            return updatedTheme;
        } catch (error) {
            this.errorHandler.handleError(error, 'updateTheme');
            throw error;
        }
    }

    async deleteTheme(themeId) {
        try {
            if (this.isDefaultTheme(themeId)) {
                throw new Error('Cannot delete default theme');
            }

            this.themes.delete(themeId);
            await this.saveUserThemes();

            if (this.currentTheme === themeId) {
                await this.applyTheme('light');
            }

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'deleteTheme');
            throw error;
        }
    }

    // 私有方法
    private registerDefaultThemes() {
        this.themes.set('light', {
            id: 'light',
            name: '浅色主题',
            type: 'default',
            variables: {
                '--primary-color': '#4a90e2',
                '--background-color': '#ffffff',
                '--text-color': '#333333',
                '--border-color': '#e0e0e0',
                '--hover-color': '#f5f7fa'
            }
        });

        this.themes.set('dark', {
            id: 'dark',
            name: '深色主题',
            type: 'default',
            variables: {
                '--primary-color': '#61dafb',
                '--background-color': '#282c34',
                '--text-color': '#ffffff',
                '--border-color': '#404040',
                '--hover-color': '#363b44'
            }
        });
    }

    private async loadUserThemes() {
        try {
            const userThemes = await this.storageManager.getData('userThemes');
            if (userThemes) {
                Object.entries(userThemes).forEach(([id, theme]) => {
                    if (!this.isDefaultTheme(id)) {
                        this.themes.set(id, theme);
                    }
                });
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'loadUserThemes');
            throw error;
        }
    }

    private async saveUserThemes() {
        try {
            const userThemes = {};
            this.themes.forEach((theme, id) => {
                if (!this.isDefaultTheme(id)) {
                    userThemes[id] = theme;
                }
            });
            await this.storageManager.saveData('userThemes', userThemes);
        } catch (error) {
            this.errorHandler.handleError(error, 'saveUserThemes');
            throw error;
        }
    }

    private validateTheme(theme) {
        return theme
            && theme.id
            && theme.name
            && theme.variables
            && typeof theme.variables === 'object'
            && Object.keys(theme.variables).length > 0;
    }

    private setupEventListeners() {
        // 监听主题切换事件
        document.addEventListener('themeToggle', () => {
            const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(nextTheme).catch(error => {
                this.errorHandler.handleError(error, 'themeToggle');
            });
        });

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (this.currentTheme === 'system') {
                const theme = e.matches ? 'dark' : 'light';
                this.applyTheme(theme).catch(error => {
                    this.errorHandler.handleError(error, 'systemThemeChange');
                });
            }
        });
    }

    private isDefaultTheme(themeId) {
        return ['light', 'dark', 'system'].includes(themeId);
    }
}

export default ThemeManager;
