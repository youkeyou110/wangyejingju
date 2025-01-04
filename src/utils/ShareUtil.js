import QRCode from 'qrcode';

export class ShareUtil {
    static async shareToSocial(dataUrl, text) {
        try {
            if (navigator.share) {
                // 使用Web Share API
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'quote-card.png', { type: 'image/png' });

                await navigator.share({
                    title: '金句卡片',
                    text: text,
                    files: [file]
                });

                return true;
            }
            return false;
        } catch (error) {
            console.error('分享失败:', error);
            return false;
        }
    }

    static async generateQRCode(dataUrl) {
        try {
            // 获取预览容器的样式和文本
            const previewContainer = document.querySelector('.preview-container');
            const text = previewContainer.textContent;
            const computedStyle = window.getComputedStyle(previewContainer);

            // 构建参数对象
            const params = {
                text,
                style: {
                    background: computedStyle.background,
                    color: computedStyle.color,
                    fontFamily: computedStyle.fontFamily,
                    fontSize: computedStyle.fontSize,
                    padding: computedStyle.padding,
                    borderRadius: computedStyle.borderRadius,
                }
            };

            // 将参数编码为URL安全的格式
            const encodedParams = btoa(encodeURIComponent(JSON.stringify(params)));

            // 使用GitHub Pages URL
            const previewUrl = `https://your-username.github.io/quote-card-generator/preview.html?data=${encodedParams}`;

            console.log('原始URL长度:', previewUrl.length);

            // 检查数据大小
            const maxQRSize = 2953;  // QR码版本40-L的最大容量（字节）
            if (previewUrl.length > maxQRSize) {
                throw new Error(`数据大小(${(previewUrl.length / 1024).toFixed(1)}KB)超出QR码容量限制(${(maxQRSize / 1024).toFixed(1)}KB)`);
            }

            // 生成二维码
            return await QRCode.toDataURL(previewUrl, {
                width: 200,
                margin: 2,
                errorCorrectionLevel: 'L',
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (error) {
            console.error('生成二维码失败:', error.message);
            console.error('错误详情:', error);
            throw error;
        }
    }

    static async copyToClipboard(dataUrl) {
        try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
            return true;
        } catch (error) {
            console.error('复制到剪贴板失败:', error);
            return false;
        }
    }
}
