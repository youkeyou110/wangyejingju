class TemplateManager {
    constructor() {
        this.templates = [];
        this.currentTemplate = null;
    }

    // 加载预设模板
    async loadPresetTemplates() {
        const presets = [
            {
                id: 'simple',
                name: '简约风格',
                style: {
                    background: {
                        type: 'solid',
                        color: '#ffffff'
                    },
                    font: {
                        family: 'Noto Sans SC',
                        size: '18px',
                        color: '#333333',
                        lineHeight: '1.5'
                    },
                    layout: {
                        padding: '20px',
                        textAlign: 'center'
                    },
                    effects: {
                        shadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid #eee'
                    }
                }
            },
            // 更多预设模板...
        ];

        this.templates = [...presets];
        return this.templates;
    }

    // 导入自定义模板
    importTemplate(template) {
        // 验证模板格式
        if(this.validateTemplate(template)) {
            this.templates.push(template);
            this.saveTemplates();
        }
    }

    // 导出模板
    exportTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        return template ? JSON.stringify(template) : null;
    }

    // 应用模板
    applyTemplate(templateId) {
        this.currentTemplate = this.templates.find(t => t.id === templateId);
        return this.currentTemplate;
    }

    // 保存模板
    async saveTemplates() {
        await chrome.storage.sync.set({templates: this.templates});
    }
}

export default TemplateManager;
