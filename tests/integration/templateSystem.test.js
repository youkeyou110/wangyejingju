import { TemplateManager } from '@/templateManager';
import { StyleEditor } from '@/styleEditor';
import { CardExporter } from '@/cardExporter';
import { ErrorHandler } from '@/errorHandler';
import { i18n } from '@/i18n';

describe('Template System Integration', () => {
  let templateManager;
  let styleEditor;
  let cardExporter;
  let errorHandler;
  let mockToast;

  beforeEach(() => {
    // 设置 DOM 环境
    document.body.innerHTML = `
      <div id="cardPreview"></div>
      <div id="templateList"></div>
      <div class="style-controls">
        <!-- 样式控制元素 -->
      </div>
    `;

    mockToast = {
      success: jest.fn(),
      error: jest.fn()
    };

    errorHandler = new ErrorHandler(i18n, mockToast);
    templateManager = new TemplateManager();
    styleEditor = new StyleEditor(templateManager, errorHandler);
    cardExporter = new CardExporter();
  });

  describe('Template Creation and Export Flow', () => {
    it('should create template and export card', async () => {
      // 1. 创建新模板
      const newTemplate = {
        name: '测试模板',
        style: {
          background: { type: 'color', value: '#ffffff' },
          font: {
            family: 'Arial',
            size: '16px',
            color: '#000000'
          },
          layout: { padding: '20px' },
          effects: {}
        }
      };

      await templateManager.saveTemplate(newTemplate);

      // 2. 应用模板样式
      const templates = await templateManager.getAllTemplates();
      const savedTemplate = templates.find(t => t.name === '测试模板');
      expect(savedTemplate).toBeDefined();

      styleEditor.loadStyle(savedTemplate.style);
      const previewElement = document.getElementById('cardPreview');
      expect(previewElement.style.backgroundColor).toBe('rgb(255, 255, 255)');

      // 3. 导出卡片
      const exportSpy = jest.spyOn(cardExporter, 'exportCard');
      await cardExporter.exportCard(previewElement, {
        format: 'png',
        quality: 0.9,
        scale: 1
      });

      expect(exportSpy).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle and recover from errors', async () => {
      // 1. 模拟存储错误
      chrome.storage.local.get.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      // 2. 尝试加载模板
      await expect(templateManager.getAllTemplates()).rejects.toThrow();
      expect(mockToast.error).toHaveBeenCalled();

      // 3. 恢复正常操作
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ customTemplates: [] });
      });

      const templates = await templateManager.getAllTemplates();
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
    });
  });

  describe('Style Update Flow', () => {
    it('should update style and reflect changes', async () => {
      // 1. 初始样式
      const initialStyle = {
        background: { type: 'color', value: '#ffffff' },
        font: { family: 'Arial', size: '16px' },
        layout: {},
        effects: {}
      };
      styleEditor.loadStyle(initialStyle);

      // 2. 更新样式
      styleEditor.updateStyle('background', {
        type: 'color',
        value: '#ff0000'
      });

      // 3. 验证更新
      const currentStyle = styleEditor.getCurrentStyle();
      expect(currentStyle.background.value).toBe('#ff0000');

      // 4. 验证预览更新
      const previewElement = document.getElementById('cardPreview');
      expect(previewElement.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  describe('Language Change Flow', () => {
    it('should update UI when language changes', async () => {
      // 1. 初始��语言
      await i18n.init();

      // 2. 切换语言
      await i18n.changeLocale('en');

      // 3. 验证模板名称更新
      const templates = await templateManager.getAllTemplates();
      const templateList = document.getElementById('templateList');
      templateList.innerHTML = templates.map(template => `
        <div class="template-card">
          <span data-i18n="templates.${template.id}">${template.name}</span>
        </div>
      `).join('');

      i18n.updatePageTranslations();

      // 4. 验证翻译是否应用
      const templateNames = templateList.querySelectorAll('[data-i18n]');
      templateNames.forEach(element => {
        expect(element.textContent).not.toBe('');
      });
    });
  });
}); 