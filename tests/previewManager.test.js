import { PreviewManager } from '@/previewManager';

describe('PreviewManager', () => {
  let previewManager;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'cardPreview';
    document.body.appendChild(container);

    // 添加其他必要的DOM元素
    const zoomControls = `
      <button id="zoomOut">-</button>
      <span id="zoomLevel">100%</span>
      <button id="zoomIn">+</button>
      <button id="resetZoom">↺</button>
    `;
    document.body.innerHTML += zoomControls;

    previewManager = new PreviewManager();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('zoom', () => {
    it('should update zoom level within limits', () => {
      previewManager.zoom(0.1); // 低于最小值
      expect(previewManager.zoomLevel).toBe(previewManager.minZoom);

      previewManager.zoom(3); // 高于最大值
      expect(previewManager.zoomLevel).toBe(previewManager.maxZoom);

      previewManager.zoom(1.5); // 正常值
      expect(previewManager.zoomLevel).toBe(1.5);
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      const overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      document.body.appendChild(overlay);
    });

    it('should show and hide loading overlay', () => {
      previewManager.showLoading();
      expect(document.getElementById('loadingOverlay').style.display).toBe('flex');

      previewManager.hideLoading();
      expect(document.getElementById('loadingOverlay').style.display).toBe('none');
    });
  });
}); 