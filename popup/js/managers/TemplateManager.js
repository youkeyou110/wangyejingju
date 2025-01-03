import Ajv from 'ajv';
import {
    TEMPLATE_VERSION,
    TEMPLATE_TYPES,
    templateSchema
} from '../../types/template';

class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.validator = new Ajv();
        this.validateTemplate = this.validator.compile(templateSchema);
        this.init();
    }

    async init() {
        // 加载预设模板
        await this.loadPresetTemplates();

        // 加载自定义模板
        await this.loadCustomTemplates();

        // 加载市场模板
        await this.loadMarketTemplates();
    }

    // 加载预设模板
    async loadPresetTemplates() {
        try {
            const response = await fetch('templates/preset.json');
            const presets = await response.json();

            presets.forEach(template => {
                template.type = TEMPLATE_TYPES.PRESET;
                if (this.validateTemplate(template)) {
                    this.templates.set(template.id, template);
                }
            });
        } catch (error) {
            console.error('Failed to load preset templates:', error);
        }
    }

    // 加载自定义模板
    async loadCustomTemplates() {
        try {
            const { customTemplates } = await chrome.storage.sync.get('customTemplates');
            if (customTemplates) {
                customTemplates.forEach(template => {
                    if (this.validateTemplate(template)) {
                        this.templates.set(template.id, template);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load custom templates:', error);
        }
    }

    // 加载市场模板
    async loadMarketTemplates() {
        try {
            const response = await fetch('https://api.example.com/templates/market');
            const marketTemplates = await response.json();

            marketTemplates.forEach(template => {
                template.type = TEMPLATE_TYPES.MARKET;
                if (this.validateTemplate(template)) {
                    this.templates.set(template.id, template);
                }
            });
        } catch (error) {
            console.error('Failed to load market templates:', error);
        }
    }

    // 导入模板
    async importTemplate(templateData) {
        try {
            let template;

            if (typeof templateData === 'string') {
                template = JSON.parse(templateData);
            } else {
                template = templateData;
            }

            // 添加必要信息
            template.id = `template-${Date.now()}`;
            template.type = TEMPLATE_TYPES.CUSTOM;
            template.version = TEMPLATE_VERSION;
            template.createdAt = new Date().toISOString();

            if (this.validateTemplate(template)) {
                this.templates.set(template.id, template);
                await this.saveCustomTemplates();
                return template;
            } else {
                throw new Error('Invalid template format');
            }
        } catch (error) {
            console.error('Failed to import template:', error);
            throw error;
        }
    }

    // 导出模板
    exportTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (template) {
            return JSON.stringify(template, null, 2);
        }
        return null;
    }

    // 批量导入模板
    async importTemplates(templatesData) {
        const results = [];
        for (const data of templatesData) {
            try {
                const template = await this.importTemplate(data);
                results.push({
                    success: true,
                    template
                });
            } catch (error) {
                results.push({
                    success: false,
                    error
                });
            }
        }
        return results;
    }

    // 保存自定义模板
    async saveCustomTemplates() {
        const customTemplates = Array.from(this.templates.values())
            .filter(t => t.type === TEMPLATE_TYPES.CUSTOM);

        await chrome.storage.sync.set({ customTemplates });
    }

    // 获取模板
    getTemplate(id) {
        return this.templates.get(id);
    }

    // 获取所有模板
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    // 按类型获取模板
    getTemplatesByType(type) {
        return Array.from(this.templates.values())
            .filter(t => t.type === type);
    }

    // 按分类获取模板
    getTemplatesByCategory(category) {
        return Array.from(this.templates.values())
            .filter(t => t.category === category);
    }

    // 搜索模板
    searchTemplates(query) {
        const lowercaseQuery = query.toLowerCase();
        return Array.from(this.templates.values())
            .filter(t =>
                t.name.toLowerCase().includes(lowercaseQuery) ||
                t.description?.toLowerCase().includes(lowercaseQuery) ||
                t.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
            );
    }

    // 删除模板
    async deleteTemplate(id) {
        const template = this.templates.get(id);
        if (template && template.type === TEMPLATE_TYPES.CUSTOM) {
            this.templates.delete(id);
            await this.saveCustomTemplates();
            return true;
        }
        return false;
    }

    // 更新模板
    async updateTemplate(id, updates) {
        const template = this.templates.get(id);
        if (template && template.type === TEMPLATE_TYPES.CUSTOM) {
            const updatedTemplate = {
                ...template,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            if (this.validateTemplate(updatedTemplate)) {
                this.templates.set(id, updatedTemplate);
                await this.saveCustomTemplates();
                return updatedTemplate;
            }
        }
        return null;
    }
}

export default TemplateManager;
