class TemplateList {
  constructor(templateManager, container) {
    this.templateManager = templateManager;
    this.container = container;
    this.templates = [];
    this.selectedTemplateId = null;
  }

  async init() {
    try {
      // 获取所有模板
      this.templates = await this.templateManager.getAllTemplates();

      // 初始化预览容器
      this.templateManager.initPreview(this.container);

      // 渲染模板列表
      await this.render();

      // 绑定事件
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize template list:', error);
    }
  }

  async render() {
    this.container.innerHTML = '';
    this.container.className = 'template-list';

    for (const template of this.templates) {
      const previewElement = this.templateManager.generatePreview(template);
      if (previewElement) {
        // 添加操作按钮
        const actions = document.createElement('div');
        actions.className = 'template-actions';
        actions.innerHTML = `
          <button class="template-action-button" data-action="use">
            ${chrome.i18n.getMessage('buttons_use')}
          </button>
          <button class="template-action-button" data-action="export">
            ${chrome.i18n.getMessage('buttons_export')}
          </button>
          ${!template.id.startsWith('custom_') ? '' : `
            <button class="template-action-button" data-action="delete">
              ${chrome.i18n.getMessage('buttons_delete')}
            </button>
          `}
        `;

        previewElement.appendChild(actions);
        this.container.appendChild(previewElement);
      }
    }
  }

  bindEvents() {
    this.container.addEventListener('click', async (e) => {
      const button = e.target.closest('.template-action-button');
      if (!button) return;

      const preview = button.closest('.template-preview');
      const templateId = preview.getAttribute('data-template-id');
      const template = this.templates.find(t => t.id === templateId);

      switch (button.dataset.action) {
        case 'use':
          this.selectTemplate(template);
          break;
        case 'export':
          await this.templateManager.exportTemplate(template);
          break;
        case 'delete':
          if (confirm(chrome.i18n.getMessage('messages_prompt_deleteTemplate'))) {
            await this.templateManager.deleteTemplate(templateId);
            await this.init(); // 重新加载列表
          }
          break;
      }
    });
  }

  selectTemplate(template) {
    this.selectedTemplateId = template.id;
    // 触发模板选择事件
    this.container.dispatchEvent(new CustomEvent('templateSelected', {
      detail: { template }
    }));
  }
}

export default TemplateList;
