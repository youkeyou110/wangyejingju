import { deflate, inflate } from 'pako';

// 压缩数据
export const compress = async (data) => {
    try {
        const jsonString = JSON.stringify(data);
        const compressed = deflate(jsonString);
        return compressed;
    } catch (error) {
        console.error('Compression failed:', error);
        throw error;
    }
};

// 解压数据
export const decompress = async (compressed) => {
    try {
        const jsonString = inflate(compressed, { to: 'string' });
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Decompression failed:', error);
        throw error;
    }
};

// 计算压缩率
export const getCompressionRatio = (original, compressed) => {
    const originalSize = new Blob([JSON.stringify(original)]).size;
    const compressedSize = new Blob([compressed]).size;
    return (originalSize - compressedSize) / originalSize;
};

// 自动压缩
export const autoCompress = async (data, threshold = 1024) => {
    const originalSize = new Blob([JSON.stringify(data)]).size;
    if (originalSize > threshold) {
        return await compress(data);
    }
    return data;
};

// 智能解压
export const smartDecompress = async (data) => {
    try {
        // 尝试解析JSON
        JSON.parse(data);
        return data;
    } catch {
        // 如果解析失败，说明是压缩数据
        return await decompress(data);
    }
};
