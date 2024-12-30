import { html2canvas } from 'html2canvas';
import defaultTemplates from '../../templates/default-templates';

class PopupManager {
    constructor() {
        this.init();
    }

    async init() {
        this.initTemplateSelector();
        this.initEditor();
        this.initPreview();
        this.initToolbar();
        this.loadSettings();
    }

    // 初始化模板选择器
    initTemplateSelector() {
        const selector = document.getElementById('template-selector');
        defaultTemplates.forEach(template => {
            const item = this.createTemplateItem(template);
            selector.appendChild(item);
        });
    }

    // 创建模板项
    createTemplateItem(template) {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.innerHTML = `
            <img src="${template.thumbnail}" alt="${template.name}">
            <span>${template.name}</span>
        `;
        item.addEventListener('click', () => this.selectTemplate(template));
        return item;
    }

    // 选择模板
    selectTemplate(template) {
        this.currentTemplate = template;
        this.updateEditor();
        this.updatePreview();
    }

    // 更新编辑器
    updateEditor() {
        const editor = document.getElementById('editor');
        editor.innerHTML = this.createEditorHTML();
        this.bindEditorEvents();
    }

    // 更新预览
    updatePreview() {
        const preview = document.getElementById('preview');
        preview.innerHTML = this.createPreviewHTML();
    }

    // 导出卡片
    async exportCard() {
        const preview = document.getElementById('preview');
        try {
            const canvas = await html2canvas(preview);
            const dataUrl = canvas.toDataURL('image/png');

            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'quote-card.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('导出失败:', error);
        }
    }

    // 加载设置
    async loadSettings() {
        const result = await chrome.storage.local.get('settings');
        this.settings = result.settings || {};
        this.applySettings();
    }

    // 应用设置
    applySettings() {
        document.body.classList.toggle('dark-theme', this.settings.theme === 'dark');
        // 应用其他设置...
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
