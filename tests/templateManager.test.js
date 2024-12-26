import { TemplateManager } from '@/templateManager';

describe('TemplateManager', () => {
  let templateManager;
  const mockDefaultTemplates = [
    {
      id: 'simple_white',
      name: '简约白',
      style: {
        background: { type: 'color', value: '#ffffff' },
        font: { family: 'Arial', size: '16px', color: '#000000' },
        layout: { padding: '20px' },
        effects: {}
      }
    }
  ];

  beforeEach(() => {
    templateManager = new TemplateManager();
    templateManager.defaultTemplates = mockDefaultTemplates;
    
    // 清除存储模拟
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
  });

  describe('getAllTemplates', () => {
    it('should return default templates when no custom templates exist', async () => {
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({});
      });

      const templates = await templateManager.getAllTemplates();
      expect(templates).toEqual(mockDefaultTemplates);
    });

    it('should combine default and custom templates', async () => {
      const mockCustomTemplate = {
        id: 'custom_1',
        name: '自定义模板',
        style: { /* ... */ }
      };

      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ customTemplates: [mockCustomTemplate] });
      });

      const templates = await templateManager.getAllTemplates();
      expect(templates).toHaveLength(2);
      expect(templates).toContainEqual(mockCustomTemplate);
      expect(templates).toContainEqual(mockDefaultTemplates[0]);
    });

    it('should handle storage errors', async () => {
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback(new Error('Storage error'));
      });

      await expect(templateManager.getAllTemplates()).rejects.toThrow();
    });
  });

  describe('saveTemplate', () => {
    const newTemplate = {
      name: '新模板',
      style: {
        background: { type: 'color', value: '#f0f0f0' },
        font: { family: 'Arial', size: '16px' },
        layout: {},
        effects: {}
      }
    };

    it('should save new template with generated id', async () => {
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ customTemplates: [] });
      });

      await templateManager.saveTemplate(newTemplate);

      const saveCall = chrome.storage.local.set.mock.calls[0][0];
      expect(saveCall.customTemplates[0].id).toMatch(/^custom_\d+$/);
      expect(saveCall.customTemplates[0].name).toBe(newTemplate.name);
    });

    it('should append to existing custom templates', async () => {
      const existingTemplate = {
        id: 'custom_1',
        name: '已有模板',
        style: {}
      };

      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ customTemplates: [existingTemplate] });
      });

      await templateManager.saveTemplate(newTemplate);

      const saveCall = chrome.storage.local.set.mock.calls[0][0];
      expect(saveCall.customTemplates).toHaveLength(2);
      expect(saveCall.customTemplates[0]).toEqual(existingTemplate);
    });

    it('should validate template data before saving', async () => {
      const invalidTemplate = {
        name: '无效模板'
        // 缺少 style 字段
      };

      await expect(templateManager.saveTemplate(invalidTemplate))
        .rejects.toThrow('Invalid template data');
    });
  });

  describe('deleteTemplate', () => {
    it('should not allow deleting default templates', async () => {
      await expect(templateManager.deleteTemplate('simple_white'))
        .rejects.toThrow('Cannot delete default template');
    });

    it('should delete custom template', async () => {
      const customTemplate = {
        id: 'custom_1',
        name: '要删除的模板',
        style: {}
      };

      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ customTemplates: [customTemplate] });
      });

      await templateManager.deleteTemplate('custom_1');

      const saveCall = chrome.storage.local.set.mock.calls[0][0];
      expect(saveCall.customTemplates).toHaveLength(0);
    });

    it('should handle non-existent template', async () => {
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ customTemplates: [] });
      });

      await expect(templateManager.deleteTemplate('custom_999'))
        .rejects.toThrow('Template not found');
    });
  });

  describe('applyTemplate', () => {
    const template = {
      style: {
        background: { type: 'color', value: '#ffffff' },
        font: { family: 'Arial', size: '16px', color: '#000000' },
        layout: { padding: '20px', textAlign: 'center' },
        effects: { shadow: '0 2px 4px rgba(0,0,0,0.1)' }
      }
    };

    it('should apply all style properties to element', () => {
      const element = document.createElement('div');
      templateManager.applyTemplate(template, element);

      expect(element.style.backgroundColor).toBe('#ffffff');
      expect(element.style.fontFamily).toBe('Arial');
      expect(element.style.padding).toBe('20px');
      expect(element.style.boxShadow).toBe('0 2px 4px rgba(0,0,0,0.1)');
    });

    it('should handle gradient background', () => {
      const gradientTemplate = {
        style: {
          background: {
            type: 'gradient',
            value: 'linear-gradient(45deg, #f00, #00f)'
          },
          font: {},
          layout: {},
          effects: {}
        }
      };

      const element = document.createElement('div');
      templateManager.applyTemplate(gradientTemplate, element);

      expect(element.style.background).toBe('linear-gradient(45deg, #f00, #00f)');
    });

    it('should handle missing style properties', () => {
      const incompleteTemplate = {
        style: {
          background: { type: 'color', value: '#ffffff' }
          // 缺少其他样式属性
        }
      };

      const element = document.createElement('div');
      expect(() => templateManager.applyTemplate(incompleteTemplate, element))
        .not.toThrow();
    });
  });
}); 