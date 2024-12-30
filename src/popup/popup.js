import TemplateManager from '../templates/template-manager';
import TemplateSelector from '../templates/template-selector';
import { defaultTemplates } from '../templates/default-templates';

document.addEventListener('DOMContentLoaded', () => {
    // 设置国际化文本
    document.title = chrome.i18n.getMessage('extName');
    document.querySelector('.title').textContent = chrome.i18n.getMessage('extName');
    document.querySelector('#quoteText').placeholder = chrome.i18n.getMessage('inputPlaceholder');
    document.querySelector('#templateBtn').textContent = chrome.i18n.getMessage('selectTemplate');
    document.querySelector('#exportBtn').textContent = chrome.i18n.getMessage('exportImage');
    document.querySelector('#settingsBtn').title = chrome.i18n.getMessage('settings');

    const quoteText = document.getElementById('quoteText');
    const previewCard = document.getElementById('previewCard');
    const templateBtn = document.getElementById('templateBtn');
    const exportBtn = document.getElementById('exportBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    // 初始化模板管理器
    const templateManager = new TemplateManager();
    defaultTemplates.forEach(template => {
        templateManager.registerTemplate(TemplateManager.createTemplate(template));
    });

    // 初始化模板选择器
    const templateSelector = new TemplateSelector(templateManager);
    templateSelector.setOnSelect(template => {
        templateManager.applyTemplate(template.id, previewCard);
        templateSelector.hide();
    });

    // 加载设置
    loadSettings();

    // 监听文本变化
    quoteText.addEventListener('input', () => {
        updatePreview(quoteText.value);
    });

    // 选择模板
    templateBtn.addEventListener('click', () => {
        templateSelector.show();
    });

    // 导出图片
    exportBtn.addEventListener('click', () => {
        exportImage();
    });

    // 打开设置
    settingsBtn.addEventListener('click', () => {
        showSettings();
    });
});

// 加载设置
async function loadSettings() {
    try {
        const result = await chrome.runtime.sendMessage({
            type: 'getData',
            key: 'settings'
        });
        if (result.success && result.data) {
            applySettings(result.data);
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// 应用设置
function applySettings(settings) {
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    // 应用其他设置...
}

// 更新预览
function updatePreview(text) {
    const cardContent = previewCard.querySelector('.card-content');
    cardContent.textContent = text;
}

// 导出图片
async function exportImage() {
    try {
        const canvas = await html2canvas(previewCard);
        const imageUrl = canvas.toDataURL('image/png');

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'quote-card.png';
        link.href = imageUrl;
        link.click();
    } catch (error) {
        console.error('Failed to export image:', error);
    }
}

// 显示设置
function showSettings() {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings/settings.html') });
}
