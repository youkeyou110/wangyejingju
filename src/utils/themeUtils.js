// 生成主题变量
export const generateThemeVariables = (theme) => {
    const variables = {};

    // 处理颜色
    if (theme.colors) {
        for (const [key, value] of Object.entries(theme.colors)) {
            variables[`color-${key}`] = value;
        }
    }

    // 处理排版
    if (theme.typography) {
        for (const [key, value] of Object.entries(theme.typography)) {
            variables[`typography-${key}`] = value;
        }
    }

    // 处理间距
    if (theme.spacing) {
        for (const [key, value] of Object.entries(theme.spacing)) {
            variables[`spacing-${key}`] = value;
        }
    }

    // 处理动画
    if (theme.animation) {
        for (const [key, value] of Object.entries(theme.animation)) {
            variables[`animation-${key}`] = value;
        }
    }

    return variables;
};

// 生成主题样式
export const generateThemeStyles = (variables) => {
    return Object.entries(variables)
        .map(([key, value]) => `--${key}: ${value};`)
        .join('\n');
};

// 计算颜色
export const calculateColor = (color, options = {}) => {
    const { lighten, darken, alpha } = options;

    // 转换颜色为RGB
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    // 应用亮度调整
    if (lighten) {
        rgb.r += Math.round((255 - rgb.r) * lighten);
        rgb.g += Math.round((255 - rgb.g) * lighten);
        rgb.b += Math.round((255 - rgb.b) * lighten);
    }

    if (darken) {
        rgb.r = Math.round(rgb.r * (1 - darken));
        rgb.g = Math.round(rgb.g * (1 - darken));
        rgb.b = Math.round(rgb.b * (1 - darken));
    }

    // 应用透明度
    if (alpha !== undefined) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    return rgbToHex(rgb);
};

// 辅助函数：HEX转RGB
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// 辅助函数：RGB转HEX
const rgbToHex = ({ r, g, b }) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// 创建主题构建器
export const createThemeBuilder = () => {
    const theme = {
        name: '',
        version: '1.0.0',
        colors: {},
        typography: {},
        spacing: {},
        animation: {}
    };

    return {
        setName(name) {
            theme.name = name;
            return this;
        },

        setVersion(version) {
            theme.version = version;
            return this;
        },

        setColor(key, value) {
            theme.colors[key] = value;
            return this;
        },

        setTypography(key, value) {
            theme.typography[key] = value;
            return this;
        },

        setSpacing(key, value) {
            theme.spacing[key] = value;
            return this;
        },

        setAnimation(key, value) {
            theme.animation[key] = value;
            return this;
        },

        extend(baseTheme) {
            theme.colors = { ...baseTheme.colors, ...theme.colors };
            theme.typography = { ...baseTheme.typography, ...theme.typography };
            theme.spacing = { ...baseTheme.spacing, ...theme.spacing };
            theme.animation = { ...baseTheme.animation, ...theme.animation };
            return this;
        },

        build() {
            if (!theme.name) {
                throw new Error('Theme name is required');
            }
            return { ...theme };
        }
    };
};
