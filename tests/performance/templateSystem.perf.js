import { TemplateManager } from '@/templateManager';
import { StyleEditor } from '@/styleEditor';
import { CardExporter } from '@/cardExporter';

describe('Template System Performance', () => {
  let templateManager;
  let styleEditor;
  let cardExporter;
  let startTime;

  beforeEach(() => {
    templateManager = new TemplateManager();
    styleEditor = new StyleEditor(templateManager);
    cardExporter = new CardExporter();
    startTime = performance.now();
  });

  afterEach(() => {
    const endTime = performance.now();
    console.log(`Test took ${endTime - startTime}ms`);
  });

  describe('Template Operations', () => {
    it('should handle bulk template operations efficiently', async () => {
      const templates = Array(100).fill(null).map((_, i) => ({
        name: `Template ${i}`,
        style: {
          background: { type: 'color', value: '#ffffff' },
          font: { family: 'Arial', size: '16px' },
          layout: {},
          effects: {}
        }
      }));

      const saveStart = performance.now();
      await Promise.all(templates.map(t => templateManager.saveTemplate(t)));
      const saveEnd = performance.now();

      expect(saveEnd - saveStart).toBeLessThan(1000); // 应该在1秒内完成

      const loadStart = performance.now();
      const loadedTemplates = await templateManager.getAllTemplates();
      const loadEnd = performance.now();

      expect(loadEnd - loadStart).toBeLessThan(100); // 应该在100ms内完成
      expect(loadedTemplates.length).toBeGreaterThan(100);
    });
  });

  describe('Style Updates', () => {
    it('should handle rapid style updates efficiently', () => {
      const element = document.createElement('div');
      const updates = Array(1000).fill(null).map((_, i) => ({
        category: 'background',
        value: { type: 'color', value: `#${i.toString(16).padStart(6, '0')}` }
      }));

      const updateStart = performance.now();
      updates.forEach(({ category, value }) => {
        styleEditor.updateStyle(category, value);
      });
      const updateEnd = performance.now();

      expect(updateEnd - updateStart).toBeLessThan(500); // 应该在500ms内完成
    });
  });

  describe('Export Performance', () => {
    it('should export cards efficiently at different scales', async () => {
      const element = document.createElement('div');
      element.style.width = '800px';
      element.style.height = '600px';
      element.textContent = '测试文本';

      const scales = [1, 2, 4];
      for (const scale of scales) {
        const exportStart = performance.now();
        await cardExporter.exportCard(element, { scale });
        const exportEnd = performance.now();

        const expectedTime = scale * 200; // 基准时间 * 缩放比例
        expect(exportEnd - exportStart).toBeLessThan(expectedTime);
      }
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage during operations', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize;
      
      // 执行一系列操作
      const templates = Array(100).fill(null).map((_, i) => ({
        name: `Template ${i}`,
        style: {
          background: { type: 'color', value: '#ffffff' },
          font: { family: 'Arial', size: '16px' },
          layout: {},
          effects: {}
        }
      }));

      await Promise.all(templates.map(t => templateManager.saveTemplate(t)));
      await templateManager.getAllTemplates();

      const finalMemory = performance.memory?.usedJSHeapSize;
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 增加不应超过50MB
      }
    });
  });
}); 