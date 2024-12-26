class TemplateManager {
  constructor() {
    this.defaultTemplates = [
      {
        id: 'simple',
        name: '简约白',
        style: {
          background: {
            type: 'color',
            value: '#ffffff'
          },
          font: {
            family: 'Microsoft YaHei',
            size: '24px',
            color: '#333333',
            lineHeight: '1.5',
            letterSpacing: '0.05em'
          },
          layout: {
            padding: '40px',
            textAlign: 'center',
            width: '800px',
            height: '400px'
          },
          effects: {
            shadow: 'none',
            border: 'none'
          }
        }
      },
      {
        id: 'elegant',
        name: '优雅灰',
        style: {
          background: {
            type: 'gradient',
            value: 'linear-gradient(45deg, #f3f4f6 0%, #fff 100%)'
          },
          font: {
            family: 'SimSun',
            size: '28px',
            color: '#2c3e50',
            lineHeight: '1.8',
            letterSpacing: '0.1em'
          },
          layout: {
            padding: '50px',
            textAlign: 'left',
            width: '800px',
            height: '400px'
          },
          effects: {
            shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }
        }
      },
      {
        id: 'modern',
        name: '现代蓝',
        style: {
          background: {
            type: 'gradient',
            value: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)'
          },
          font: {
            family: 'Microsoft YaHei',
            size: '26px',
            color: '#ffffff',
            lineHeight: '1.6',
            letterSpacing: '0.08em',
            weight: 'bold'
          },
          layout: {
            padding: '45px',
            textAlign: 'center',
            width: '800px',
            height: '400px'
          },
          effects: {
            shadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            border: 'none'
          }
        }
      },
      {
        id: 'vintage',
        name: '复古棕',
        style: {
          background: {
            type: 'color',
            value: '#f5e6d3'
          },
          font: {
            family: 'KaiTi',
            size: '30px',
            color: '#5c4b3c',
            lineHeight: '2',
            letterSpacing: '0.12em'
          },
          layout: {
            padding: '60px',
            textAlign: 'center',
            width: '800px',
            height: '400px'
          },
          effects: {
            shadow: 'none',
            border: '2px solid #8b7355'
          }
        }
      },
      {
        id: 'dark',
        name: '暗夜黑',
        style: {
          background: {
            type: 'gradient',
            value: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)'
          },
          font: {
            family: 'Microsoft YaHei',
            size: '24px',
            color: '#ffffff',
            lineHeight: '1.7',
            letterSpacing: '0.06em',
            weight: '300'
          },
          layout: {
            padding: '50px',
            textAlign: 'center',
            width: '800px',
            height: '400px'
          },
          effects: {
            shadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }
      }
    ];
  }

  // 获取所有模板
  async getAllTemplates() {
    const { customTemplates = [] } = await chrome.storage.local.get('customTemplates');
    return [...this.defaultTemplates, ...customTemplates];
  }

  // 保存自定义模板
  async saveTemplate(template) {
    const { customTemplates = [] } = await chrome.storage.local.get('customTemplates');
    customTemplates.push({
      id: `custom_${Date.now()}`,
      ...template
    });
    await chrome.storage.local.set({ customTemplates });
  }

  // 删除自定义模板
  async deleteTemplate(templateId) {
    const { customTemplates = [] } = await chrome.storage.local.get('customTemplates');
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    await chrome.storage.local.set({ customTemplates: updatedTemplates });
  }

  // 应用模板
  applyTemplate(template, cardElement) {
    const { style } = template;
    
    // 应用背景
    if (style.background.type === 'color') {
      cardElement.style.background = style.background.value;
    } else if (style.background.type === 'gradient') {
      cardElement.style.background = style.background.value;
    }

    // 应用字体样式
    Object.assign(cardElement.style, {
      fontFamily: style.font.family,
      fontSize: style.font.size,
      color: style.font.color,
      lineHeight: style.font.lineHeight,
      letterSpacing: style.font.letterSpacing
    });

    // 应用布局
    Object.assign(cardElement.style, {
      padding: style.layout.padding,
      textAlign: style.layout.textAlign,
      width: style.layout.width,
      height: style.layout.height
    });

    // 应用特效
    cardElement.style.boxShadow = style.effects.shadow;
    cardElement.style.border = style.effects.border;
  }
} 