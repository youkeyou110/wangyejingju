class ExportManager {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.exportQueue = [];
    this.isExporting = false;
  }

  // 初始化画布
  initCanvas(width, height, devicePixelRatio = window.devicePixelRatio) {
    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  // 绘制卡片内容
  async drawCard(card, styleManager) {
    const { text, style } = card;
    const css = styleManager.generateCSS();

    // 应用容器样式
    Object.assign(this.canvas.style, css.container);

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制背景
    if (style.background.type === 'gradient') {
      const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
      gradient.addColorStop(0, style.background.gradient.start);
      gradient.addColorStop(1, style.background.gradient.end);
      this.ctx.fillStyle = gradient;
    } else if (style.background.type === 'image' && style.background.image) {
      await this.drawBackgroundImage(style.background.image);
    } else {
      this.ctx.fillStyle = style.background.color;
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制文本
    this.ctx.font = `${style.font.weight} ${style.font.size} ${style.font.family}`;
    this.ctx.fillStyle = style.font.color;
    this.ctx.textAlign = style.font.align;
    this.ctx.textBaseline = 'middle';

    // 文本换行处理
    const lines = this.wrapText(text, this.canvas.width - 40);
    const lineHeight = parseFloat(style.font.lineHeight);
    const totalHeight = lines.length * lineHeight;
    const startY = (this.canvas.height - totalHeight) / 2;

    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      this.ctx.fillText(line, this.canvas.width / 2, y);
    });

    // 绘制水印
    if (style.effects.watermark) {
      await this.drawWatermark(style.effects.watermark);
    }
  }

  // 文本换行处理
  wrapText(text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    lines.push(currentLine);
    return lines;
  }

  // 绘制背景图片
  async drawBackgroundImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        resolve();
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  // 绘制水印
  async drawWatermark(watermark) {
    const { text, font, color, opacity } = watermark;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(text, this.canvas.width - 10, this.canvas.height - 10);
    this.ctx.restore();
  }

  // 导出单张图片
  async exportImage(card, options = {}) {
    const {
      format = 'png',
      quality = 0.9,
      width = 800,
      height = 600,
      filename = 'quote-card'
    } = options;

    // 初始化画布
    this.initCanvas(width, height);

    // 绘制卡片
    await this.drawCard(card);

    // 导出为指定格式
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        resolve(blob);
      }, `image/${format}`, quality);
    });
  }

  // 批量导出
  async batchExport(cards, options = {}, onProgress) {
    const results = [];
    let completed = 0;

    for (const card of cards) {
      try {
        const blob = await this.exportImage(card, options);
        results.push({
          success: true,
          data: blob,
          card
        });
      } catch (error) {
        results.push({
          success: false,
          error,
          card
        });
      }

      completed++;
      if (onProgress) {
        onProgress(completed / cards.length);
      }
    }

    return results;
  }

  // 获取支持的导出格式
  getSupportedFormats() {
    return ['png', 'jpg', 'webp'];
  }

  // 验证导出选项
  validateExportOptions(options) {
    const {
      format = 'png',
      quality = 0.9,
      width = 800,
      height = 600
    } = options;

    if (!this.getSupportedFormats().includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    if (quality < 0 || quality > 1) {
      throw new Error('Quality must be between 0 and 1');
    }

    if (width <= 0 || height <= 0) {
      throw new Error('Invalid dimensions');
    }

    return true;
  }
}

export default ExportManager;
