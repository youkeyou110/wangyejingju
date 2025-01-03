// 弹出窗口入口
import '../styles/popup.css';
import { templates } from '../data/templates';
import { StyleEditor } from '../components/StyleEditor';
import { ExportSettings } from '../components/ExportSettings';
import { ExportUtil } from '../utils/ExportUtil';
import { TemplateEditor } from '../components/TemplateEditor';
import { TemplateManager } from '../utils/TemplateManager';

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

    // 初始化模板列表函数
    function renderTemplateList() {
        const templateList = document.querySelector('.template-list');
        templateList.innerHTML = ''; // 清空现有列表

        templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.templateId = template.id;

            if (template.id === selectedTemplate.id) {
                templateItem.classList.add('active');
            }

            // 生成缩略图
            const thumbnail = generateThumbnail(template.style);

            templateItem.innerHTML = `
                <img class="template-thumbnail" src="${thumbnail}" alt="${template.name}">
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

        // 保存到本地存储
        chrome.storage.local.set({ templates: templates });
    }

    // 生成缩略图
    function generateThumbnail(style) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        // 应用背景样式
        if (style.background.includes('gradient')) {
            const gradient = ctx.createLinearGradient(0, 0, 120, 80);
            const colors = style.background.match(/#[a-f0-9]{6}/gi) || ['#ffffff', '#e0e0e0'];
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = style.background || '#ffffff';
        }

        ctx.fillRect(0, 0, 120, 80);

        return canvas.toDataURL();
    }

    let selectedTemplate = templates[0];

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

    // 初始化模板编辑器
    const templateEditorContainer = document.createElement('div');
    templateEditorContainer.style.display = 'none';
    document.body.appendChild(templateEditorContainer);

    const templateEditor = new TemplateEditor(templateEditorContainer, (template) => {
        // 生成缩略图
        template.thumbnail = generateThumbnail(template.style);
        // 保存新模板
        templates.push(template);
        // 更新模板列表
        renderTemplateList();
        // 隐藏编辑器
        templateEditorContainer.style.display = 'none';
        // 选中新模板
        selectedTemplate = template;
        updatePreview();
    });

    // 初始化模板管理按钮
    document.getElementById('add-template').onclick = () => {
        templateEditorContainer.style.display = 'block';
    };

    // 导入模板
    document.getElementById('import-templates').onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const importedTemplates = await TemplateManager.importTemplates(file);

                // 添加新模板
                templates.push(...importedTemplates);

                // 更新模板列表
                renderTemplateList();

                alert('模板导入成功！');
            } catch (error) {
                console.error('导入模板失败:', error);
                alert(error.message || '导入模板失败，请检查文件格式');
            }
        };

        input.click();
    };

    // 导出模板
    document.getElementById('export-templates').onclick = () => {
        try {
            TemplateManager.exportTemplates(templates);
        } catch (error) {
            console.error('导出模板失败:', error);
            alert('导出模板失败，请重试');
        }
    };

    // 初始加载模板
    chrome.storage.local.get(['templates'], (result) => {
        if (result.templates) {
            templates.push(...result.templates);
        }
        renderTemplateList();
    });
});
