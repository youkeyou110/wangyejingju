import { EventEmitter } from 'events';
import logManager from './LogManager';
import imageCompression from 'browser-image-compression';

class CompressionManager extends EventEmitter {
    constructor() {
        super();
        this.config = {
            image: {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                quality: 0.8
            },
            text: {
                removeComments: true,
                removeWhitespace: true,
                minifyURLs: true
            }
        };
    }

    // 压缩图片
    async compressImage(file, options = {}) {
        try {
            const config = { ...this.config.image, ...options };
            const compressedFile = await imageCompression(file, config);

            this.emit('compressionComplete', {
                type: 'image',
                originalSize: file.size,
                compressedSize: compressedFile.size,
                ratio: compressedFile.size / file.size
            });

            return compressedFile;
        } catch (error) {
            logManager.error('Image compression failed:', error);
            throw error;
        }
    }

    // 压缩文本
    compressText(text, options = {}) {
        try {
            const config = { ...this.config.text, ...options };
            let compressed = text;

            if (config.removeComments) {
                compressed = compressed.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
            }

            if (config.removeWhitespace) {
                compressed = compressed.replace(/\s+/g, ' ').trim();
            }

            if (config.minifyURLs) {
                compressed = compressed.replace(/(https?:\/\/[^\s]+)/g, url => {
                    try {
                        return new URL(url).toString();
                    } catch {
                        return url;
                    }
                });
            }

            this.emit('compressionComplete', {
                type: 'text',
                originalSize: text.length,
                compressedSize: compressed.length,
                ratio: compressed.length / text.length
            });

            return compressed;
        } catch (error) {
            logManager.error('Text compression failed:', error);
            throw error;
        }
    }

    // 压缩字体
    async compressFont(fontFile, options = {}) {
        try {
            // 使用fontmin或其他字体压缩库
            // 这里仅作示例
            this.emit('compressionComplete', {
                type: 'font',
                originalSize: fontFile.size,
                compressedSize: fontFile.size,
                ratio: 1
            });

            return fontFile;
        } catch (error) {
            logManager.error('Font compression failed:', error);
            throw error;
        }
    }

    // 获取压缩统计
    getCompressionStats() {
        // 实现压缩统计逻辑
        return {
            totalCompressed: 0,
            totalSaved: 0,
            averageRatio: 0
        };
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}

export default new CompressionManager();
