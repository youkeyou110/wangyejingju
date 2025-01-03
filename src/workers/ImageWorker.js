// 图片处理Worker
self.onmessage = async function(e) {
    const { type, data } = e.data;

    try {
        switch (type) {
            case 'compress':
                const compressed = await compressImage(data);
                self.postMessage({ type: 'compressed', data: compressed });
                break;

            case 'watermark':
                const watermarked = await addWatermark(data);
                self.postMessage({ type: 'watermarked', data: watermarked });
                break;

            default:
                throw new Error('Unknown operation type');
        }
    } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
    }
};

// 压缩图片
async function compressImage(data) {
    const { image, options } = data;

    // 创建Canvas
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 绘制图片
    ctx.drawImage(image, 0, 0);

    // 压缩
    const blob = await canvas.convertToBlob({
        type: options.type || 'image/jpeg',
        quality: options.quality || 0.8
    });

    return await blobToBase64(blob);
}

// 添加水印
async function addWatermark(data) {
    const { image, watermark } = data;

    // 创建Canvas
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 绘制原图
    ctx.drawImage(image, 0, 0);

    // 添加水印
    if (watermark.type === 'text') {
        // 文本水印
        ctx.font = `${watermark.fontSize}px ${watermark.font}`;
        ctx.fillStyle = watermark.color;
        ctx.globalAlpha = watermark.opacity;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(watermark.rotate * Math.PI / 180);
        ctx.fillText(watermark.text, -ctx.measureText(watermark.text).width/2, 0);
    } else {
        // 图片水印
        const watermarkImage = await loadImage(watermark.image);
        ctx.globalAlpha = watermark.opacity;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(watermark.rotate * Math.PI / 180);
        ctx.drawImage(
            watermarkImage,
            -watermarkImage.width/2,
            -watermarkImage.height/2
        );
    }

    // 导出
    const blob = await canvas.convertToBlob({
        type: 'image/png'
    });

    return await blobToBase64(blob);
}

// 工具函数
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
