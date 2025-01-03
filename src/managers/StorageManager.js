import { deflate, inflate } from 'pako';
import { LRUCache } from 'lru-cache';

class StorageManager {
    constructor(options = {}) {
        this.options = {
            maxSize: options.maxSize || 100 * 1024 * 1024, // 100MB
            maxAge: options.maxAge || 30 * 24 * 60 * 60 * 1000, // 30天
            compressionThreshold: options.compressionThreshold || 1024, // 1KB
            namespace: options.namespace || 'app',
            version: options.version || '1.0'
        };

        // 初始化缓存
        this.cache = new LRUCache({
            max: 1000,
            maxSize: this.options.maxSize,
            ttl: this.options.maxAge,
            sizeCalculation: (value, key) => {
                return JSON.stringify(value).length;
            }
        });

        // 初始化索引
        this.index = new Map();
        this.loadIndex();
    }

    // 设置数据
    async set(key, value, options = {}) {
        const fullKey = this.getFullKey(key);
        const metadata = {
            key: fullKey,
            timestamp: Date.now(),
            size: 0,
            compressed: false,
            type: options.type || 'data',
            tags: options.tags || [],
            priority: options.priority || 0
        };

        try {
            // 序列化数据
            let serialized = JSON.stringify(value);
            metadata.size = serialized.length;

            // 压缩数据
            if (serialized.length > this.options.compressionThreshold) {
                const compressed = await this.compress(serialized);
                if (compressed.length < serialized.length) {
                    serialized = compressed;
                    metadata.compressed = true;
                }
            }

            // 存储数据
            await chrome.storage.local.set({ [fullKey]: serialized });

            // 更新缓存
            this.cache.set(fullKey, value);

            // 更新索引
            this.updateIndex(fullKey, metadata);

            return true;
        } catch (error) {
            console.error('Storage set failed:', error);
            return false;
        }
    }

    // 获取数据
    async get(key, defaultValue = null) {
        const fullKey = this.getFullKey(key);

        try {
            // 检查缓存
            const cached = this.cache.get(fullKey);
            if (cached !== undefined) {
                return cached;
            }

            // 从存储中获取
            const result = await chrome.storage.local.get(fullKey);
            if (!result[fullKey]) {
                return defaultValue;
            }

            // 获取元数据
            const metadata = this.index.get(fullKey);
            if (!metadata) {
                return defaultValue;
            }

            // 解析数据
            let value = result[fullKey];
            if (metadata.compressed) {
                value = await this.decompress(value);
            }
            value = JSON.parse(value);

            // 更新缓存
            this.cache.set(fullKey, value);

            return value;
        } catch (error) {
            console.error('Storage get failed:', error);
            return defaultValue;
        }
    }

    // 删除数据
    async remove(key) {
        const fullKey = this.getFullKey(key);

        try {
            // 删除存储
            await chrome.storage.local.remove(fullKey);

            // 清除缓存
            this.cache.delete(fullKey);

            // 删除索引
            this.index.delete(fullKey);
            this.saveIndex();

            return true;
        } catch (error) {
            console.error('Storage remove failed:', error);
            return false;
        }
    }

    // 清理过期数据
    async cleanup() {
        const now = Date.now();
        const expired = [];

        // 查找过期数据
        for (const [key, metadata] of this.index) {
            if (now - metadata.timestamp > this.options.maxAge) {
                expired.push(key);
            }
        }

        // 批量删除
        if (expired.length > 0) {
            await chrome.storage.local.remove(expired);
            expired.forEach(key => {
                this.cache.delete(key);
                this.index.delete(key);
            });
            this.saveIndex();
        }
    }

    // 查询数据
    async query(options = {}) {
        const {
            type,
            tags,
            fromDate,
            toDate,
            priority,
            limit
        } = options;

        // 过滤数据
        let results = Array.from(this.index.entries())
            .filter(([_, metadata]) => {
                if (type && metadata.type !== type) return false;
                if (tags && !tags.every(tag => metadata.tags.includes(tag))) return false;
                if (fromDate && metadata.timestamp < fromDate) return false;
                if (toDate && metadata.timestamp > toDate) return false;
                if (priority !== undefined && metadata.priority !== priority) return false;
                return true;
            })
            .map(([key, metadata]) => ({ key: this.getOriginalKey(key), metadata }));

        // 排序和限制
        results.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
        if (limit) {
            results = results.slice(0, limit);
        }

        return results;
    }

    // 获取存储统计
    async getStats() {
        const stats = {
            totalItems: this.index.size,
            totalSize: 0,
            compressedItems: 0,
            compressedSize: 0,
            typeStats: {},
            tagStats: {}
        };

        for (const metadata of this.index.values()) {
            stats.totalSize += metadata.size;
            if (metadata.compressed) {
                stats.compressedItems++;
                stats.compressedSize += metadata.size;
            }

            // 类型统计
            stats.typeStats[metadata.type] = (stats.typeStats[metadata.type] || 0) + 1;

            // 标签统计
            metadata.tags.forEach(tag => {
                stats.tagStats[tag] = (stats.tagStats[tag] || 0) + 1;
            });
        }

        return stats;
    }

    // 压缩数据
    async compress(data) {
        try {
            const uint8Array = new TextEncoder().encode(data);
            const compressed = deflate(uint8Array);
            return btoa(String.fromCharCode.apply(null, compressed));
        } catch (error) {
            console.error('Compression failed:', error);
            return data;
        }
    }

    // 解压数据
    async decompress(data) {
        try {
            const uint8Array = new Uint8Array(
                atob(data).split('').map(char => char.charCodeAt(0))
            );
            const decompressed = inflate(uint8Array);
            return new TextDecoder().decode(decompressed);
        } catch (error) {
            console.error('Decompression failed:', error);
            return data;
        }
    }

    // 生成完整键名
    getFullKey(key) {
        return `${this.options.namespace}:${this.options.version}:${key}`;
    }

    // 获取原始键名
    getOriginalKey(fullKey) {
        const parts = fullKey.split(':');
        return parts.slice(2).join(':');
    }

    // 更新索引
    updateIndex(key, metadata) {
        this.index.set(key, metadata);
        this.saveIndex();
    }

    // 保存索引
    async saveIndex() {
        try {
            const indexData = JSON.stringify(Array.from(this.index.entries()));
            await chrome.storage.local.set({ [`${this.options.namespace}:index`]: indexData });
        } catch (error) {
            console.error('Index save failed:', error);
        }
    }

    // 加载索引
    async loadIndex() {
        try {
            const result = await chrome.storage.local.get(`${this.options.namespace}:index`);
            const indexData = result[`${this.options.namespace}:index`];
            if (indexData) {
                this.index = new Map(JSON.parse(indexData));
            }
        } catch (error) {
            console.error('Index load failed:', error);
        }
    }
}

export default new StorageManager();
