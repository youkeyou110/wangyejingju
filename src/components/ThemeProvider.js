import React, { useContext, useEffect } from 'react';
import themeManager from '../managers/ThemeManager';

// 创建主题上下文
const ThemeContext = React.createContext({
    theme: null,
    setTheme: () => {},
    customize: () => {}
});

// 主题提供者组件
export const ThemeProvider = ({ children, initialTheme = 'light@1.0.0' }) => {
    const [theme, setThemeState] = React.useState(null);

    // 初始化主题
    useEffect(() => {
        const loadTheme = async () => {
            await themeManager.apply(initialTheme);
            setThemeState(themeManager.getCurrentTheme());
        };
        loadTheme();
    }, [initialTheme]);

    // 切换主题
    const setTheme = async (themeKey) => {
        await themeManager.apply(themeKey);
        setThemeState(themeManager.getCurrentTheme());
    };

    // 自定义主题
    const customize = async (customization) => {
        if (theme) {
            await themeManager.customize(theme.key, customization);
            setThemeState(themeManager.getCurrentTheme());
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, customize }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 主题钩子
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// 主题消费者组件
export const ThemeConsumer = ThemeContext.Consumer;
