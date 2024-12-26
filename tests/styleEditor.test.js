import { StyleEditor } from '@/styleEditor';

describe('StyleEditor', () => {
  let styleEditor;
  let mockTemplateManager;
  let mockErrorHandler;

  beforeEach(() => {
    // 创建必要的 DOM 元素
    document.body.innerHTML = `
      <div id="cardPreview"></div>
      <input type="color" id="bgColorPicker" value="#ffffff" />
      <input type="radio" name="bgType" value="color" checked />
      <input type="radio" name="bgType" value="gradient" />
      <div id="solidColorControls"></div>
      <div id="gradientControls" style="display: none;">
        <select id="gradientDirection">
          <option value="to right">从左到右</option>
          <option value="to bottom">从上到下</option>
        </select>
      </div>
      <input type="text" id="fontSize" value="16" />
      <input type="color" id="fontColorPicker" value="#000000" />
      <select id="fontWeight">
        <option value="normal">正常</option>
        <option value="bold">粗体</option>
      </select>
      <input type="range" id="lineHeight" value="150" />
      <input type="range" id="letterSpacing" value="0" />
    `;

    mockTemplateManager = {
      applyTemplate: jest.fn()
    };

    mockErrorHandler = {
      handleError: jest.fn(),
      wrapEventHandler: fn => fn
    };

    styleEditor = new StyleEditor(mockTemplateManager, mockErrorHandler);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default style', () => {
      expect(styleEditor.currentStyle).toBeDefined();
      expect(styleEditor.currentStyle.background).toBeDefined();
      expect(styleEditor.currentStyle.font).toBeDefined();
      expect(styleEditor.currentStyle.layout).toBeDefined();
      expect(styleEditor.currentStyle.effects).toBeDefined();
    });

    it('should bind all control events', () => {
      const spy = jest.spyOn(styleEditor, 'updatePreview');
      
      // 触发背景颜色变化
      const bgColorPicker = document.getElementById('bgColorPicker');
      bgColorPicker.value = '#ff0000';
      bgColorPicker.dispatchEvent(new Event('input'));

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('background controls', () => {
    it('should update solid background color', () => {
      const bgColorPicker = document.getElementById('bgColorPicker');
      bgColorPicker.value = '#ff0000';
      bgColorPicker.dispatchEvent(new Event('input'));

      expect(styleEditor.currentStyle.background.type).toBe('color');
      expect(styleEditor.currentStyle.background.value).toBe('#ff0000');
    });

    it('should switch between color and gradient', () => {
      const gradientRadio = document.querySelector('input[value="gradient"]');
      gradientRadio.checked = true;
      gradientRadio.dispatchEvent(new Event('change'));

      expect(document.getElementById('solidColorControls').style.display).toBe('none');
      expect(document.getElementById('gradientControls').style.display).toBe('block');
    });

    it('should update gradient background', () => {
      // 切换到渐变模式
      const gradientRadio = document.querySelector('input[value="gradient"]');
      gradientRadio.checked = true;
      gradientRadio.dispatchEvent(new Event('change'));

      // 更新渐变方向
      const directionSelect = document.getElementById('gradientDirection');
      directionSelect.value = 'to bottom';
      directionSelect.dispatchEvent(new Event('change'));

      expect(styleEditor.currentStyle.background.type).toBe('gradient');
      expect(styleEditor.currentStyle.background.value).toContain('to bottom');
    });
  });

  describe('font controls', () => {
    it('should update font size', () => {
      const fontSizeInput = document.getElementById('fontSize');
      fontSizeInput.value = '20';
      fontSizeInput.dispatchEvent(new Event('input'));

      expect(styleEditor.currentStyle.font.size).toBe('20px');
    });

    it('should update font color', () => {
      const fontColorPicker = document.getElementById('fontColorPicker');
      fontColorPicker.value = '#ff0000';
      fontColorPicker.dispatchEvent(new Event('input'));

      expect(styleEditor.currentStyle.font.color).toBe('#ff0000');
    });

    it('should update font weight', () => {
      const fontWeightSelect = document.getElementById('fontWeight');
      fontWeightSelect.value = 'bold';
      fontWeightSelect.dispatchEvent(new Event('change'));

      expect(styleEditor.currentStyle.font.weight).toBe('bold');
    });

    it('should update line height', () => {
      const lineHeightInput = document.getElementById('lineHeight');
      lineHeightInput.value = '200';
      lineHeightInput.dispatchEvent(new Event('input'));

      expect(styleEditor.currentStyle.font.lineHeight).toBe('2');
    });

    it('should update letter spacing', () => {
      const letterSpacingInput = document.getElementById('letterSpacing');
      letterSpacingInput.value = '20';
      letterSpacingInput.dispatchEvent(new Event('input'));

      expect(styleEditor.currentStyle.font.letterSpacing).toBe('20px');
    });
  });

  describe('style management', () => {
    it('should load style correctly', () => {
      const newStyle = {
        background: { type: 'color', value: '#ff0000' },
        font: {
          family: 'Arial',
          size: '20px',
          color: '#000000'
        },
        layout: { padding: '20px' },
        effects: {}
      };

      styleEditor.loadStyle(newStyle);

      expect(styleEditor.currentStyle).toEqual(newStyle);
      expect(mockTemplateManager.applyTemplate).toHaveBeenCalled();
    });

    it('should get current style', () => {
      const style = styleEditor.getCurrentStyle();
      expect(style).toEqual(styleEditor.currentStyle);
    });

    it('should handle invalid style data', () => {
      const invalidStyle = {
        background: { type: 'invalid' }
      };

      expect(() => styleEditor.loadStyle(invalidStyle)).toThrow();
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle DOM element not found', () => {
      document.body.innerHTML = ''; // 清空 DOM
      expect(() => styleEditor.init()).not.toThrow();
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });

    it('should handle invalid input values', () => {
      const fontSizeInput = document.getElementById('fontSize');
      fontSizeInput.value = 'invalid';
      fontSizeInput.dispatchEvent(new Event('input'));

      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('preview updates', () => {
    it('should update preview when style changes', () => {
      styleEditor.updateStyle('background', {
        type: 'color',
        value: '#ff0000'
      });

      expect(mockTemplateManager.applyTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          style: expect.objectContaining({
            background: { type: 'color', value: '#ff0000' }
          })
        }),
        expect.any(Element)
      );
    });

    it('should debounce preview updates', () => {
      jest.useFakeTimers();

      // 快速连续更新
      styleEditor.updateStyle('font', { size: '16px' });
      styleEditor.updateStyle('font', { size: '18px' });
      styleEditor.updateStyle('font', { size: '20px' });

      expect(mockTemplateManager.applyTemplate).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(mockTemplateManager.applyTemplate).toHaveBeenCalledTimes(1);
    });
  });
}); 