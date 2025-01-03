import html2canvas from 'html2canvas';

export class ExportUtil {
    static async exportToImage(element, options = {}) {
        const {
            format = 'png',
            quality = 1.0,
            scale = 2,
            width,
            height
        } = options;

        // 设置临时尺寸
        const originalStyle = element.style.cssText;
        if (width) element.style.width = `${width}px`;
        if (height) element.style.height = `${height}px`;

        try {
            // 创建canvas
            const canvas = await html2canvas(element, {
                scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null
            });

            // 恢复原始尺寸
            element.style.cssText = originalStyle;

            // 转换格式
            let dataUrl;
            switch (format.toLowerCase()) {
                case 'jpeg':
                case 'jpg':
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                    break;
                case 'webp':
                    dataUrl = canvas.toDataURL('image/webp', quality);
                    break;
                case 'png':
                default:
                    dataUrl = canvas.toDataURL('image/png');
                    break;
            }

            return dataUrl;
        } catch (error) {
            console.error('导出图片失败:', error);
            throw error;
        }
    }

    static download(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }
}
