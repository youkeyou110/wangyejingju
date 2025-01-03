import { EventEmitter } from 'events';
import logManager from './LogManager';

class CacheManager extends EventEmitter {
    constructor() {
        super();
        this.memoryCache = new Map();
        this.config = {
            maxMemoryEntries: 1000,
            maxAge: 24 * 60 * 60 * 1000, // 24小时
            cleanupInterval: 60 * 60 * 1000 // 1小时
        };
        this.setupCleanup();
    }

    // 设置定期清理
    setupCleanup() {
        setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }

    // 获取缓存
    async get(key, options = {}) {
        try {
            // 先查内存缓存
            const memoryItem = this.getFromMemory(key);
            if (memoryItem) {
                return memoryItem;
            }

            // 再查浏览器缓存
            const storageItem = await this.getFromStorage(key);
            if (storageItem) {
                // 如果找到了，放入内存缓存
                this.setInMemory(key, storageItem);
                return storageItem;
            }

            // 如果配置了加载器，使用加载器获取数据
            if (options.loader) {
                const value = await options.loader();
                await this.set(key, value, options);
                return value;
            }

            return null;
        } catch (error) {
            logManager.error('Cache get error:', error);
            return null;
        }
    }

    // 设置缓存
    async set(key, value, options = {}) {
        try {
            const cacheItem = {
                value,
                timestamp: Date.now(),
                maxAge: options.maxAge || this.config.maxAge,
                metadata: options.metadata || {}
            };

            // 存入内存缓存
            this.setInMemory(key, cacheItem);

            // 存入浏览器缓存
            await this.setInStorage(key, cacheItem);

            this.emit('cacheUpdated', { key, action: 'set' });
            return true;
        } catch (error) {
            logManager.error('Cache set error:', error);
            return false;
        }
    }

    // 删除缓存
    async delete(key) {
        try {
            // 从内存缓存删除
            this.memoryCache.delete(key);

            // 从浏览器缓存删除
            await chrome.storage.local.remove(this.getStorageKey(key));

            this.emit('cacheUpdated', { key, action: 'delete' });
            return true;
        } catch (error) {
            logManager.error('Cache delete error:', error);
            return false;
        }
    }

    // 清空缓存
    async clear() {
        try {
            // 清空内存缓存
            this.memoryCache.clear();

            // 清空浏览器缓存
            const keys = await this.getAllStorageKeys();
            await chrome.storage.local.remove(keys);

            this.emit('cacheUpdated', { action: 'clear' });
            return true;
        } catch (error) {
            logManager.error('Cache clear error:', error);
            return false;
        }
    }

    // 从内存缓存获取
    getFromMemory(key) {
        const item = this.memoryCache.get(key);
        if (!item) return null;

        // 检查是否过期
        if (this.isExpired(item)) {
            this.memoryCache.delete(key);
            return null;
        }

        return item.value;
    }

    // 从浏览器缓存获取
    async getFromStorage(key) {
        const storageKey = this.getStorageKey(key);
        const result = await chrome.storage.local.get(storageKey);
        const item = result[storageKey];

        if (!item) return null;

        // 检查是否过期
        if (this.isExpired(item)) {
            await chrome.storage.local.remove(storageKey);
            return null;
        }

        return item.value;
    }

    // 存入内存缓存
    setInMemory(key, value) {
        // 检查容量
        if (this.memoryCache.size >= this.config.maxMemoryEntries) {
            // 删除最旧的项
            const oldestKey = Array.from(this.memoryCache.keys())[0];
            this.memoryCache.delete(oldestKey);
        }

        this.memoryCache.set(key, value);
    }

    // 存入浏览器缓存
    async setInStorage(key, value) {
        const storageKey = this.getStorageKey(key);
        await chrome.storage.local.set({ [storageKey]: value });
    }

    // 获取所有存储键
    async getAllStorageKeys() {
        const items = await chrome.storage.local.get(null);
        return Object.keys(items).filter(key =>
            key.startsWith('cache:')
        );
    }

    // 检查是否过期
    isExpired(item) {
        const now = Date.now();
        return (now - item.timestamp) > item.maxAge;
    }

    // 清理过期缓存
    async cleanup() {
        try {
            // 清理内存缓存
            for (const [key, item] of this.memoryCache) {
                if (this.isExpired(item)) {
                    this.memoryCache.delete(key);
                }
            }

            // 清理浏览器缓存
            const keys = await this.getAllStorageKeys();
            for (const key of keys) {
                const result = await chrome.storage.local.get(key);
                const item = result[key];
                if (item && this.isExpired(item)) {
                    await chrome.storage.local.remove(key);
                }
            }

            this.emit('cacheUpdated', { action: 'cleanup' });
        } catch (error) {
            logManager.error('Cache cleanup error:', error);
        }
    }

    // 获取存储键
    getStorageKey(key) {
        return `cache:${key}`;
    }

    // 获取缓存统计
    async getStats() {
        try {
            const memoryStats = {
                count: this.memoryCache.size,
                size: 0
            };

            const storageStats = {
                count: 0,
                size: 0
            };

            // 计算内存缓存大小
            for (const [key, value] of this.memoryCache) {
                memoryStats.size += this.estimateSize(key) + this.estimateSize(value);
            }

            // 计算存储缓存大小
            const items = await chrome.storage.local.get(null);
            for (const key of Object.keys(items)) {
                if (key.startsWith('cache:')) {
                    storageStats.count++;
                    storageStats.size += this.estimateSize(key) + this.estimateSize(items[key]);
                }
            }

            return {
                memory: memoryStats,
                storage: storageStats,
                timestamp: Date.now()
            };
        } catch (error) {
            logManager.error('Get cache stats error:', error);
            return null;
        }
    }

    // 估算对象大小
    estimateSize(obj) {
        const str = JSON.stringify(obj);
        return str.length * 2; // 假设每个字符占2字节
    }
}

export default new CacheManager();
