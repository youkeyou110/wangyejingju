import { CardExporter } from '@/cardExporter';

describe('CardExporter', () => {
  let cardExporter;
  let mockElement;

  beforeEach(() => {
    cardExporter = new CardExporter();
    mockElement = document.createElement('div');
    mockElement.style.width = '400px';
    mockElement.style.height = '300px';
    mockElement.textContent = '测试文本';

    // 模拟 canvas 上下文
    const mockContext = {
      drawImage: jest.fn(),
      canvas: {
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test')
      }
    };
    jest.spyOn(cardExporter.canvas, 'getContext').mockReturnValue(mockContext);

    // 模拟 URL API
    global.URL.createObjectURL = jest.fn();
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportCard', () => {
    it('should export card with default options', async () => {
      const link = { click: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);

      await cardExporter.exportCard(mockElement);

      expect(link.download).toMatch(/^card_\d+\.png$/);
      expect(link.click).toHaveBeenCalled();
    });

    it('should handle different export formats', async () => {
      const formats = ['png', 'jpeg', 'webp'];
      const link = { click: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);

      for (const format of formats) {
        await cardExporter.exportCard(mockElement, { format });
        expect(link.download).toMatch(new RegExp(`\\.${format}$`));
      }
    });

    it('should apply quality settings', async () => {
      const mockToDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,test');
      const mockContext = {
        drawImage: jest.fn(),
        canvas: { toDataURL: mockToDataURL }
      };
      jest.spyOn(cardExporter.canvas, 'getContext').mockReturnValue(mockContext);

      await cardExporter.exportCard(mockElement, {
        format: 'jpeg',
        quality: 0.8
      });

      expect(mockToDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should apply scale settings', async () => {
      const scale = 2;
      const rect = {
        width: 400,
        height: 300
      };
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue(rect);

      await cardExporter.exportCard(mockElement, { scale });

      expect(cardExporter.canvas.width).toBe(rect.width * scale);
      expect(cardExporter.canvas.height).toBe(rect.height * scale);
    });
  });

  describe('error handling', () => {
    it('should handle invalid element', async () => {
      await expect(cardExporter.exportCard(null))
        .rejects.toThrow('Invalid element');
    });

    it('should handle canvas creation failure', async () => {
      const mockError = new Error('Canvas error');
      jest.spyOn(cardExporter.canvas, 'getContext').mockImplementation(() => {
        throw mockError;
      });

      await expect(cardExporter.exportCard(mockElement))
        .rejects.toThrow('Canvas error');
    });

    it('should handle SVG conversion failure', async () => {
      global.URL.createObjectURL.mockImplementation(() => {
        throw new Error('Blob creation failed');
      });

      await expect(cardExporter.exportCard(mockElement))
        .rejects.toThrow('Blob creation failed');
    });

    it('should handle download failure', async () => {
      const mockLink = {
        click: jest.fn(() => {
          throw new Error('Download failed');
        })
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      await expect(cardExporter.exportCard(mockElement))
        .rejects.toThrow('Download failed');
    });
  });

  describe('resource cleanup', () => {
    it('should revoke object URL after export', async () => {
      const blobUrl = 'blob:test';
      global.URL.createObjectURL.mockReturnValue(blobUrl);

      await cardExporter.exportCard(mockElement);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
    });

    it('should revoke object URL even if export fails', async () => {
      const blobUrl = 'blob:test';
      global.URL.createObjectURL.mockReturnValue(blobUrl);
      
      const mockLink = {
        click: jest.fn(() => {
          throw new Error('Export failed');
        })
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      await expect(cardExporter.exportCard(mockElement)).rejects.toThrow();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
    });
  });

  describe('SVG conversion', () => {
    it('should properly convert DOM to SVG', async () => {
      const link = { click: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);

      await cardExporter.exportCard(mockElement);

      const blob = global.URL.createObjectURL.mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/svg+xml;charset=utf-8');

      const reader = new FileReader();
      const svgContent = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsText(blob);
      });

      expect(svgContent).toContain('<svg');
      expect(svgContent).toContain('<foreignObject');
      expect(svgContent).toContain(mockElement.outerHTML);
    });

    it('should preserve element styles in SVG', async () => {
      mockElement.style.backgroundColor = '#ff0000';
      mockElement.style.fontFamily = 'Arial';
      mockElement.style.fontSize = '16px';

      const link = { click: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link);

      await cardExporter.exportCard(mockElement);

      const blob = global.URL.createObjectURL.mock.calls[0][0];
      const reader = new FileReader();
      const svgContent = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsText(blob);
      });

      expect(svgContent).toContain('background-color: #ff0000');
      expect(svgContent).toContain('font-family: Arial');
      expect(svgContent).toContain('font-size: 16px');
    });
  });
}); 