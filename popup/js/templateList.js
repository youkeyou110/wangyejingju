class TemplateList {
  constructor(templateManager, styleEditor, errorHandler) {
    this.templateManager = templateManager;
    this.styleEditor = styleEditor;
    this.errorHandler = errorHandler;
    this.container = document.getElementById('templateList');
    this.i18n = i18n;
    this.init();
  }

  async init() {
    await this.errorHandler.handleAsyncError(async () => {
      await this.renderTemplates();
      this.bindEvents();
    }, 'TemplateList.init');
  }

  async renderTemplates() {
    return this.errorHandler.handleAsyncError(async () => {
      const templates = await this.templateManager.getAllTemplates();
      this.container.innerHTML = templates.map(template => this.createTemplateCard(template)).join('');
    }, 'TemplateList.renderTemplates');
  }

  createTemplateCard(template) {
    const templateName = this.i18n.getMessage(`templates.${template.id}`) || template.name;
    const deleteText = this.i18n.getMessage('buttons.delete');
    
    return `
      <div class="template-card" data-template-id="${template.id}">
        <div class="template-preview" style="
          background: ${this.getBackgroundStyle(template.style.background)};
          color: ${template.style.font.color};
          font-family: ${template.style.font.family};
          padding: 12px;
          text-align: ${template.style.layout.textAlign};
          box-shadow: ${template.style.effects.shadow};
          border: ${template.style.effects.border};
        ">
          ${this.i18n.getMessage('preview.text')}
        </div>
        <div class="template-info">
          <span class="template-name">${templateName}</span>
          ${template.id.startsWith('custom_') ? 
            `<button class="delete-template-btn" data-template-id="${template.id}">${deleteText}</button>` : 
            ''}
        </div>
      </div>
    `;
  }

  getBackgroundStyle(background) {
    return background.type === 'color' ? background.value : background.value;
  }

  bindEvents() {
    // 模板选择
    const handleTemplateSelect = this.errorHandler.wrapEventHandler(async (e) => {
      const templateCard = e.target.closest('.template-card');
      if (templateCard) {
        const templateId = templateCard.dataset.templateId;
        const templates = await this.templateManager.getAllTemplates();
        const template = templates.find(t => t.id === templateId);
        if (template) {
          this.styleEditor.loadStyle(template.style);
          this.highlightSelectedTemplate(templateId);
        }
      }
    }, 'templateSelect');

    // 删除模板
    const handleTemplateDelete = this.errorHandler.wrapEventHandler(async (e) => {
      if (e.target.classList.contains('delete-template-btn')) {
        const templateId = e.target.dataset.templateId;
        
        // 确认删除
        if (!confirm(this.i18n.getMessage('messages.prompt.deleteTemplate'))) {
          return;
        }

        await this.templateManager.deleteTemplate(templateId);
        await this.renderTemplates();
        this.toast.success(this.i18n.getMessage('messages.success.templateDeleted'));
      }
    }, 'templateDelete');

    this.container.addEventListener('click', handleTemplateSelect);
    this.container.addEventListener('click', handleTemplateDelete);
  }

  async addTemplate(template) {
    return this.errorHandler.handleAsyncError(async () => {
      // 验证模板数据
      if (!this.validateTemplate(template)) {
        return;
      }

      await this.templateManager.saveTemplate(template);
      await this.renderTemplates();
    }, 'TemplateList.addTemplate');
  }

  validateTemplate(template) {
    return this.errorHandler.validateInput(template.name, {
      required: true,
      maxLength: 50,
      pattern: /^[\w\u4e00-\u9fa5\s-]+$/  // 允许字母、数字、中文、空格和连字符
    }, 'templateName');
  }

  highlightSelectedTemplate(templateId) {
    try {
      this.container.querySelectorAll('.template-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.templateId === templateId);
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'TemplateList.highlightSelectedTemplate');
    }
  }

  bindLanguageEvents() {
    window.addEventListener('localeChanged', this.errorHandler.wrapEventHandler(async () => {
      await this.renderTemplates();
    }, 'languageChanged'));
  }
} 