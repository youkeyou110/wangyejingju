import './popup.css';
import { i18n } from './js/i18n.js';
import { TemplateManager } from './js/templateManager.js';
import { StyleEditor } from './js/styleEditor.js';
import { CardExporter } from './js/cardExporter.js';
import { ErrorHandler } from './js/errorHandler.js';
import { Logger } from './js/logger.js';
import { SecurityManager } from './js/security.js';
import { PerformanceMonitor } from './js/performance.js';
import { defaultTemplates } from './js/defaultTemplates.js';

class PopupManager {
  constructor() {
    // 初始化组件
    this.i18n = new i18n();
    this.errorHandler = new ErrorHandler(this.i18n);
    this.logger = new Logger();
    this.security = new SecurityManager();
    this.performance = new PerformanceMonitor();
    this.templateManager = new TemplateManager(defaultTemplates);
    this.styleEditor = new StyleEditor(this.templateManager, this.errorHandler);
    this.cardExporter = new CardExporter();

    // 绑定DOM元素
    this.bindElements();
    // 绑定事件
    this.bindEvents();
    // 初始化
    this.init();
  }

  bindElements() {
    // 语言选择器
    this.languageSelect = document.getElementById('languageSelect');
    // 文本输入
    this.textInput = document.getElementById('textInput');
    // 模板列表
    this.templateList = document.getElementById('templateList');
    // 预览区域
    this.cardPreview = document.getElementById('cardPreview');
    // 导出按钮
    this.exportBtn = document.getElementById('exportBtn');
    // 保存模板按钮
    this.saveTemplateBtn = document.getElementById('saveTemplateBtn');
    // 导出对话框
    this.exportDialog = document.getElementById('exportDialog');
    // 加载遮罩
    this.loadingOverlay = document.getElementById('loadingOverlay');
  }

  bindEvents() {
    // 语言切换
    this.languageSelect.addEventListener('change',
      this.errorHandler.wrapEventHandler(async (e) => {
        await this.i18n.changeLocale(e.target.value);
      })
    );

    // 文本输入
    this.textInput.addEventListener('input',
      this.errorHandler.wrapEventHandler(() => {
        this.updatePreview();
      })
    );

    // 导出按钮
    this.exportBtn.addEventListener('click',
      this.errorHandler.wrapEventHandler(() => {
        this.showExportDialog();
      })
    );

    // 保存模板
    this.saveTemplateBtn.addEventListener('click',
      this.errorHandler.wrapEventHandler(async () => {
        await this.saveCurrentTemplate();
      })
    );

    // 样式控制事件
    this.bindStyleControls();
  }

  async init() {
    try {
      this.performance.startMeasure('init');
      this.showLoading();

      // 初始化国际化
      await this.i18n.init();

      // 加载模板
      await this.loadTemplates();

      // 初始化预览
      this.updatePreview();

      this.performance.endMeasure('init');
      this.hideLoading();
    } catch (error) {
      this.errorHandler.handleError(error, 'initialization');
    }
  }

  async loadTemplates() {
    const templates = await this.templateManager.getAllTemplates();
    this.templateList.innerHTML = templates.map(template => `
      <div class="template-card" data-id="${template.id}">
        <div class="template-preview">
          <!-- 预览内容 -->
        </div>
        <div class="template-info">
          <span>${template.name}</span>
        </div>
      </div>
    `).join('');

    // 绑定模板选择事件
    this.templateList.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectTemplate(card.dataset.id);
      });
    });
  }

  async selectTemplate(templateId) {
    const template = await this.templateManager.getTemplate(templateId);
    if (template) {
      this.styleEditor.loadStyle(template.style);
      this.updatePreview();
    }
  }

  updatePreview() {
    const text = this.security.sanitizeHTML(this.textInput.value);
    this.cardPreview.innerHTML = text;
    const style = this.styleEditor.getCurrentStyle();
    this.templateManager.applyTemplate({ style }, this.cardPreview);
  }

  showExportDialog() {
    this.exportDialog.style.display = 'flex';
  }

  hideExportDialog() {
    this.exportDialog.style.display = 'none';
  }

  showLoading() {
    this.loadingOverlay.style.display = 'flex';
  }

  hideLoading() {
    this.loadingOverlay.style.display = 'none';
  }

  async saveCurrentTemplate() {
    const name = prompt(this.i18n.getMessage('messages.prompt.templateName'));
    if (name) {
      const style = this.styleEditor.getCurrentStyle();
      await this.templateManager.saveTemplate({ name, style });
      await this.loadTemplates();
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
