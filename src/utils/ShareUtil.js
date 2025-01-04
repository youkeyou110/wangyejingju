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

    static async generateQRCode(dataUrl, text) {
        try {
            // 先将图片上传到临时存储服务
            const imageUrl = await this.uploadToTempStorage(dataUrl);

            // 生成预览页面URL
            const previewUrl = this.generatePreviewUrl(imageUrl, text);

            // 生成二维码
            const qrcode = await QRCode.toDataURL(previewUrl, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            return qrcode;
        } catch (error) {
            console.error('生成二维码失败:', error);
            throw error;
        }
    }

    static async uploadToTempStorage(dataUrl) {
        const formData = new FormData();
        const blob = await (await fetch(dataUrl)).blob();
        formData.append('image', blob);

        // 替换YOUR_API_KEY为实际的API key
        const response = await fetch('https://api.imgbb.com/1/upload?key=533ebaa866690475fba3ebeb31f46638', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error('图片上传失败: ' + result.error?.message);
        }
        return result.data.url;
    }

    static generatePreviewUrl(imageUrl, text) {
        const params = new URLSearchParams({
            image: imageUrl,
            text: text
        });

        // 替换your-username为你的GitHub用户名
        return `https://your-username.github.io/quote-card-generator/preview.html?${params}`;
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
