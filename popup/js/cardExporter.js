class CardExporter {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.i18n = i18n;
  }

  async exportCard(cardElement, options = {}) {
    const {
      format = 'png',
      quality = 0.92,
      scale = 1
    } = options;

    try {
      // 获取卡片尺寸
      const rect = cardElement.getBoundingClientRect();
      const width = rect.width * scale;
      const height = rect.height * scale;

      // 设置canvas尺寸
      this.canvas.width = width;
      this.canvas.height = height;

      // 将DOM转换为SVG
      const data = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${cardElement.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      // 创建Blob
      const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(blob);

      // 加载图片
      const img = new Image();
      img.src = blobURL;

      return new Promise((resolve, reject) => {
        img.onload = () => {
          // 绘制到canvas
          this.ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(blobURL);

          // 导出为指定格式
          const mimeType = `image/${format}`;
          const dataUrl = this.canvas.toDataURL(mimeType, quality);

          // 触发下载
          const link = document.createElement('a');
          link.download = `card_${Date.now()}.${format}`;
          link.href = dataUrl;
          link.click();

          resolve(dataUrl);
        };

        img.onerror = reject;
      });
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(this.i18n.getMessage('messages.error.export'));
    }
  }
} 