class StyleManager {
    constructor() {
        this.currentStyle = null;
        this.defaultStyle = {
            background: {
                type: 'solid',
                color: '#ffffff',
                gradient: null,
                image: null
            },
            font: {
                family: 'Noto Sans SC',
                size: '18px',
                weight: '400',
                color: '#333333',
                lineHeight: '1.5',
                letterSpacing: '0',
                align: 'center'
            },
            layout: {
                width: '100%',
                height: 'auto',
                padding: '20px',
                margin: '0',
                borderRadius: '4px'
            },
            effects: {
                shadow: {
                    x: '0',
                    y: '2px',
                    blur: '4px',
                    color: 'rgba(0,0,0,0.1)'
                },
                border: {
                    width: '1px',
                    style: 'solid',
                    color: '#eeeeee'
                },
                opacity: '1',
                watermark: null
            }
        };
    }

    // 应用样式
    applyStyle(style) {
        this.currentStyle = {...this.defaultStyle, ...style};
        return this.generateCSS();
    }

    // 生成CSS
    generateCSS() {
        const {background, font, layout, effects} = this.currentStyle;

        return {
            container: {
                width: layout.width,
                height: layout.height,
                padding: layout.padding,
                margin: layout.margin,
                borderRadius: layout.borderRadius,
                backgroundColor: this.generateBackground(background),
                boxShadow: this.generateShadow(effects.shadow),
                border: this.generateBorder(effects.border),
                opacity: effects.opacity
            },
            text: {
                fontFamily: font.family,
                fontSize: font.size,
                fontWeight: font.weight,
                color: font.color,
                lineHeight: font.lineHeight,
                letterSpacing: font.letterSpacing,
                textAlign: font.align
            }
        };
    }

    // 生成背景样式
    generateBackground(bg) {
        switch(bg.type) {
            case 'gradient':
                return bg.gradient;
            case 'image':
                return `url(${bg.image})`;
            default:
                return bg.color;
        }
    }

    // 生成阴影效果
    generateShadow(shadow) {
        return `${shadow.x} ${shadow.y} ${shadow.blur} ${shadow.color}`;
    }

    // 生成边框样式
    generateBorder(border) {
        return `${border.width} ${border.style} ${border.color}`;
    }

    // 更新样式属性
    updateStyle(path, value) {
        let target = this.currentStyle;
        const keys = path.split('.');
        const lastKey = keys.pop();

        for(const key of keys) {
            target = target[key];
        }

        target[lastKey] = value;
        return this.generateCSS();
    }

    // 重置为默认样式
    resetStyle() {
        this.currentStyle = {...this.defaultStyle};
        return this.generateCSS();
    }

    // 导出样式配置
    exportStyle() {
        return JSON.stringify(this.currentStyle);
    }

    // 导入样式配置
    importStyle(styleJson) {
        try {
            const style = JSON.parse(styleJson);
            this.currentStyle = {...this.defaultStyle, ...style};
            return this.generateCSS();
        } catch(e) {
            console.error('Invalid style configuration:', e);
            return null;
        }
    }
}

export default StyleManager;
