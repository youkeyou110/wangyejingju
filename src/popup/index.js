// 弹出窗口入口
import '../styles/popup.css';
import { templates } from '../data/templates';
import { StyleEditor } from '../components/StyleEditor';
import { ExportSettings } from '../components/ExportSettings';
import { ExportUtil } from '../utils/ExportUtil';

document.addEventListener('DOMContentLoaded', () => {
    console.log('弹出窗口已加载');

    // 加载选中的文本
    chrome.storage.local.get(['selectedText'], (result) => {
        if (result.selectedText) {
            const quoteText = document.getElementById('quote-text');
            if (quoteText) {
                quoteText.value = result.selectedText;
                updatePreview();
            }
            // 清除存储的文本
            chrome.storage.local.remove(['selectedText']);
        }
    });

    // 初始化模板列表
    const templateList = document.querySelector('.template-list');
    let selectedTemplate = templates[0];

    // 渲染模板列表
    templates.forEach(template => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.dataset.templateId = template.id;

        if (template.id === selectedTemplate.id) {
            templateItem.classList.add('active');
        }

        templateItem.innerHTML = `
            <img class="template-thumbnail" src="${template.thumbnail}" alt="${template.name}">
            <div class="template-name">${template.name}</div>
        `;

        templateItem.addEventListener('click', () => {
            // 更新选中状态
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('active');
            });
            templateItem.classList.add('active');
            selectedTemplate = template;

            // 更新预览
            updatePreview();
        });

        templateList.appendChild(templateItem);
    });

    // 初始化按钮事件
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const shareBtn = document.getElementById('share-btn');
    const quoteText = document.getElementById('quote-text');

    // 更新预览
    function updatePreview() {
        const previewContainer = document.querySelector('.preview-container');
        const text = quoteText.value || '在这里显示您的金句...';

        Object.assign(previewContainer.style, selectedTemplate.style);
        previewContainer.textContent = text;
    }

    generateBtn?.addEventListener('click', async () => {
        try {
            const settings = exportSettings.getSettings();
            const previewContainer = document.querySelector('.preview-container');

            // 导出图片
            const dataUrl = await ExportUtil.exportToImage(previewContainer, settings);

            // 下载图片
            const timestamp = new Date().getTime();
            ExportUtil.download(dataUrl, `quote-card-${timestamp}.${settings.format}`);
        } catch (error) {
            console.error('生成卡片失败:', error);
            alert('生成卡片失败，请重试');
        }
    });

    saveBtn?.addEventListener('click', () => {
        console.log('保存卡片');
        // TODO: 实现保存逻辑
    });

    shareBtn?.addEventListener('click', () => {
        console.log('分享卡片');
        // TODO: 实现分享逻辑
    });

    // 监听文本输入
    quoteText?.addEventListener('input', () => {
        updatePreview();
    });

    // 初始化预览
    updatePreview();

    // 初始化样式编辑器
    const styleEditorContainer = document.getElementById('style-editor');
    const styleEditor = new StyleEditor(styleEditorContainer, (style) => {
        // 更新预览样式
        const previewContainer = document.querySelector('.preview-container');
        Object.assign(previewContainer.style, style);
    });

    // 初始化导出设置
    const exportSettingsContainer = document.getElementById('export-settings');
    const exportSettings = new ExportSettings(exportSettingsContainer);
});
