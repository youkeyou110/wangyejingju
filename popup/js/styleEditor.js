class StyleEditor {
  constructor(templateManager, errorHandler) {
    this.templateManager = templateManager;
    this.errorHandler = errorHandler;
    this.currentStyle = null;
    this.i18n = i18n;
    this.init();
  }

  init() {
    this.errorHandler.handleAsyncError(async () => {
      this.initColorPicker();
      this.initFontControls();
      this.initLayoutControls();
      this.initEffectControls();
      this.bindEvents();
    }, 'StyleEditor.init');
  }

  initColorPicker() {
    // 背景类型切换
    const bgTypeInputs = document.querySelectorAll('input[name="bgType"]');
    const solidControls = document.getElementById('solidColorControls');
    const gradientControls = document.getElementById('gradientControls');

    bgTypeInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        if (e.target.value === 'color') {
          solidControls.style.display = 'block';
          gradientControls.style.display = 'none';
          this.updateSolidBackground();
        } else {
          solidControls.style.display = 'none';
          gradientControls.style.display = 'block';
          this.updateGradientBackground();
        }
      });
    });

    // 纯色背景控制
    const bgColorPicker = document.getElementById('bgColorPicker');
    bgColorPicker.addEventListener('input', () => this.updateSolidBackground());

    // 渐变背景控制
    const gradientTypeInputs = document.querySelectorAll('input[name="gradientType"]');
    const gradientDirection = document.getElementById('gradientDirection');
    const addStopBtn = document.getElementById('addGradientStop');

    gradientTypeInputs.forEach(input => {
      input.addEventListener('change', () => this.updateGradientBackground());
    });

    gradientDirection.addEventListener('change', () => this.updateGradientBackground());

    // 初始化渐变色节点
    this.initGradientStops();
    
    // 添加新的渐变色节点
    addStopBtn.addEventListener('click', () => this.addGradientStop());
  }

  initGradientStops() {
    const stops = document.querySelectorAll('.gradient-stop');
    stops.forEach(stop => this.initGradientStop(stop));
  }

  initGradientStop(stopElement) {
    const colorInput = stopElement.querySelector('.stop-color');
    const positionInput = stopElement.querySelector('.stop-position');
    const valueSpan = stopElement.querySelector('.stop-value');

    // 设置初始颜色
    if (!colorInput.value) {
      colorInput.value = '#ffffff';
    }

    // 更新位置显示
    positionInput.addEventListener('input', (e) => {
      valueSpan.textContent = `${e.target.value}%`;
      this.updateGradientBackground();
    });

    // 更新颜色
    colorInput.addEventListener('input', () => this.updateGradientBackground());

    // 添加删除按钮（如果不是第一个或最后一个节点）
    const index = parseInt(stopElement.dataset.index);
    if (index > 0 && index < document.querySelectorAll('.gradient-stop').length - 1) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'small-btn delete-stop';
      deleteBtn.textContent = '×';
      deleteBtn.addEventListener('click', () => {
        stopElement.remove();
        this.updateGradientBackground();
      });
      stopElement.appendChild(deleteBtn);
    }
  }

  addGradientStop() {
    const stops = document.querySelector('.gradient-stops');
    const newIndex = stops.querySelectorAll('.gradient-stop').length;
    const position = 50; // 默认位置在中间

    const stopElement = document.createElement('div');
    stopElement.className = 'gradient-stop';
    stopElement.dataset.index = newIndex;
    stopElement.innerHTML = `
      <input type="color" class="stop-color" />
      <input type="range" class="stop-position" min="0" max="100" value="${position}" />
      <span class="stop-value">${position}%</span>
    `;

    // 插入到"添加"按钮之前
    stops.insertBefore(stopElement, document.getElementById('addGradientStop'));
    this.initGradientStop(stopElement);
    this.updateGradientBackground();
  }

  updateSolidBackground() {
    const color = document.getElementById('bgColorPicker').value;
    this.updateStyle('background', {
      type: 'color',
      value: color
    });
  }

  updateGradientBackground() {
    const type = document.querySelector('input[name="gradientType"]:checked').value;
    const direction = document.getElementById('gradientDirection').value;
    const stops = Array.from(document.querySelectorAll('.gradient-stop')).map(stop => {
      const color = stop.querySelector('.stop-color').value;
      const position = stop.querySelector('.stop-position').value;
      return `${color} ${position}%`;
    });

    let gradient;
    if (type === 'linear') {
      gradient = `linear-gradient(${direction}, ${stops.join(', ')})`;
    } else {
      gradient = `radial-gradient(circle, ${stops.join(', ')})`;
    }

    this.updateStyle('background', {
      type: 'gradient',
      value: gradient
    });
  }

  initFontControls() {
    // 字体选择
    const fontSelect = document.getElementById('fontSelect');
    fontSelect.addEventListener('change', (e) => {
      this.updateStyle('font', {
        family: e.target.value
      });
    });

    // 字体大小
    const fontSizeInput = document.getElementById('fontSize');
    fontSizeInput.addEventListener('input', (e) => {
      this.updateStyle('font', {
        size: `${e.target.value}px`
      });
    });

    // 字体颜色
    const fontColorPicker = document.getElementById('fontColorPicker');
    fontColorPicker.addEventListener('input', (e) => {
      this.updateStyle('font', {
        color: e.target.value
      });
    });

    // 字体粗细
    const fontWeight = document.getElementById('fontWeight');
    fontWeight.addEventListener('change', (e) => {
      this.updateStyle('font', {
        weight: e.target.value
      });
    });

    // 行高
    const lineHeight = document.getElementById('lineHeight');
    const lineHeightValue = document.getElementById('lineHeightValue');
    lineHeight.addEventListener('input', (e) => {
      const value = e.target.value / 100;
      lineHeightValue.textContent = value.toFixed(1);
      this.updateStyle('font', {
        lineHeight: value
      });
    });

    // 字间距
    const letterSpacing = document.getElementById('letterSpacing');
    const letterSpacingValue = document.getElementById('letterSpacingValue');
    letterSpacing.addEventListener('input', (e) => {
      const value = `${e.target.value}px`;
      letterSpacingValue.textContent = value;
      this.updateStyle('font', {
        letterSpacing: value
      });
    });

    // 文本装饰
    const textDecoration = document.getElementById('textDecoration');
    textDecoration.addEventListener('change', (e) => {
      this.updateStyle('font', {
        textDecoration: e.target.value
      });
    });
  }

  initLayoutControls() {
    // 对齐方式控制
    const alignButtons = document.querySelectorAll('.align-btn');
    alignButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const align = btn.dataset.align;
        this.updateStyle('layout', { textAlign: align });
        
        // 更新按钮状态
        alignButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 边距控制
    const paddingSlider = document.getElementById('paddingSlider');
    const paddingValue = document.getElementById('paddingValue');
    paddingSlider.addEventListener('input', (e) => {
      const value = `${e.target.value}px`;
      paddingValue.textContent = value;
      this.updateStyle('layout', { padding: value });
    });

    // 尺寸控制
    const widthInput = document.getElementById('cardWidth');
    const heightInput = document.getElementById('cardHeight');
    
    widthInput.addEventListener('input', (e) => {
      this.updateStyle('layout', { width: `${e.target.value}px` });
    });
    
    heightInput.addEventListener('input', (e) => {
      this.updateStyle('layout', { height: `${e.target.value}px` });
    });
  }

  initEffectControls() {
    // 阴影控制
    const shadowToggle = document.getElementById('shadowToggle');
    const shadowOptions = document.querySelector('.shadow-options');
    const shadowBlur = document.getElementById('shadowBlur');
    const shadowColor = document.getElementById('shadowColor');
    const shadowOpacity = document.getElementById('shadowOpacity');

    shadowToggle.addEventListener('change', (e) => {
      shadowOptions.style.display = e.target.checked ? 'flex' : 'none';
      if (!e.target.checked) {
        this.updateStyle('effects', { shadow: 'none' });
      } else {
        this.updateShadow();
      }
    });

    [shadowBlur, shadowColor, shadowOpacity].forEach(input => {
      input.addEventListener('input', () => this.updateShadow());
    });

    // 边框控制
    const borderToggle = document.getElementById('borderToggle');
    const borderOptions = document.querySelector('.border-options');
    const borderWidth = document.getElementById('borderWidth');
    const borderColor = document.getElementById('borderColor');
    const borderStyle = document.getElementById('borderStyle');

    borderToggle.addEventListener('change', (e) => {
      borderOptions.style.display = e.target.checked ? 'flex' : 'none';
      if (!e.target.checked) {
        this.updateStyle('effects', { border: 'none' });
      } else {
        this.updateBorder();
      }
    });

    [borderWidth, borderColor, borderStyle].forEach(input => {
      input.addEventListener('input', () => this.updateBorder());
    });
  }

  updateShadow() {
    const blur = document.getElementById('shadowBlur').value;
    const color = document.getElementById('shadowColor').value;
    const opacity = document.getElementById('shadowOpacity').value / 100;
    
    const rgba = this.hexToRgba(color, opacity);
    const shadow = `0 4px ${blur}px ${rgba}`;
    
    this.updateStyle('effects', { shadow });
  }

  updateBorder() {
    const width = document.getElementById('borderWidth').value;
    const color = document.getElementById('borderColor').value;
    const style = document.getElementById('borderStyle').value;
    
    const border = `${width}px ${style} ${color}`;
    this.updateStyle('effects', { border });
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  updateStyle(category, value) {
    try {
      this.currentStyle = {
        ...this.currentStyle,
        [category]: {
          ...this.currentStyle[category],
          ...value
        }
      };
      this.updatePreview();
    } catch (error) {
      this.errorHandler.handleError(error, 'StyleEditor.updateStyle');
    }
  }

  updatePreview() {
    const previewCard = document.getElementById('cardPreview');
    const template = {
      style: this.currentStyle
    };
    this.templateManager.applyTemplate(template, previewCard);
  }

  getCurrentStyle() {
    return this.currentStyle;
  }

  loadStyle(style) {
    return this.errorHandler.handleAsyncError(async () => {
      // 验证样式数据
      if (!this.validateStyle(style)) {
        return;
      }

      this.currentStyle = style;
      this.updatePreview();
      this.updateControls();
    }, 'StyleEditor.loadStyle');
  }

  validateStyle(style) {
    // 验证样式对象的结构
    const requiredFields = ['background', 'font', 'layout', 'effects'];
    const missingFields = requiredFields.filter(field => !style[field]);
    
    if (missingFields.length > 0) {
      throw new Error(this.i18n.getMessage('messages.error.invalidStyle', [missingFields.join(', ')]));
    }

    return true;
  }

  updateControls() {
    // 更新背景类型
    const bgType = this.currentStyle.background.type;
    document.querySelector(`input[name="bgType"][value="${bgType}"]`).checked = true;

    // 更新渐变类型标签
    document.querySelectorAll('input[name="gradientType"]').forEach(input => {
      const label = input.parentElement;
      label.textContent = this.i18n.getMessage(`settings.gradientType.${input.value}`);
    });

    // 更新方向选项
    const directionSelect = document.getElementById('gradientDirection');
    directionSelect.querySelectorAll('option').forEach(option => {
      option.textContent = this.i18n.getMessage(`settings.direction.${option.value}`);
    });

    // 更新字体样式选项
    const fontWeightSelect = document.getElementById('fontWeight');
    fontWeightSelect.querySelectorAll('option').forEach(option => {
      option.textContent = this.i18n.getMessage(`settings.font.weight.${option.value}`);
    });

    // 更新文本装饰选项
    const decorationSelect = document.getElementById('textDecoration');
    decorationSelect.querySelectorAll('option').forEach(option => {
      option.textContent = this.i18n.getMessage(`settings.font.decoration.${option.value}`);
    });

    // 更新边框样式选项
    const borderStyleSelect = document.getElementById('borderStyle');
    borderStyleSelect.querySelectorAll('option').forEach(option => {
      option.textContent = this.i18n.getMessage(`settings.effects.border.style.${option.value}`);
    });
  }

  bindEvents() {
    // 绑定各种事件处理
  }
} 