class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.currentTemplate = null;
    }

    // 模板数据结构
    static createTemplate(config) {
        return {
            id: config.id,
            name: config.name,
            description: config.description,
            thumbnail: config.thumbnail,
            author: config.author,
            createTime: config.createTime || Date.now(),
            updateTime: config.updateTime || Date.now(),
            style: {
                width: config.style?.width || '800px',
                height: config.style?.height || '400px',
                background: config.style?.background || '#ffffff',
                fontFamily: config.style?.fontFamily || 'inherit',
                fontSize: config.style?.fontSize || '24px',
                color: config.style?.color || '#333333',
                padding: config.style?.padding || '40px',
                borderRadius: config.style?.borderRadius || '8px',
                boxShadow: config.style?.boxShadow || '0 2px 8px rgba(0,0,0,0.1)'
            },
            content: {
                layout: config.content?.layout || 'center',
                quote: config.content?.quote || '',
                author: config.content?.author || '',
                source: config.content?.source || ''
            }
        };
    }

    // 注册模板
    registerTemplate(template) {
        this.templates.set(template.id, template);
    }

    // 获取模板
    getTemplate(id) {
        return this.templates.get(id);
    }

    // 应用模板
    applyTemplate(id, container) {
        const template = this.getTemplate(id);
        if (!template) return false;

        this.currentTemplate = template;
        Object.assign(container.style, template.style);

        // 应用内容布局
        container.innerHTML = this.generateTemplateHTML(template);
        return true;
    }

    // 生成模板HTML
    generateTemplateHTML(template) {
        return `
            <div class="quote-content" style="text-align: ${template.content.layout}">
                <div class="quote-text">${template.content.quote}</div>
                ${template.content.author ? `<div class="quote-author">—— ${template.content.author}</div>` : ''}
                ${template.content.source ? `<div class="quote-source">${template.content.source}</div>` : ''}
            </div>
        `;
    }

    // 更新模板内容
    updateTemplateContent(content) {
        if (!this.currentTemplate) return;
        Object.assign(this.currentTemplate.content, content);
    }

    // 导出模板
    exportTemplate() {
        return this.currentTemplate;
    }
}

export default TemplateManager;
