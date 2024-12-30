const NodeCache = require('node-cache');
const config = require('../config/storage.config');

class CacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: config.storage.cache.duration,
            checkperiod: 600, // 每10分钟检查过期缓存
            maxKeys: 1000 // 最大缓存条目数
        });
    }

    // 设置缓存
    set(key, value) {
        return this.cache.set(key, value);
    }

    // 获取缓存
    get(key) {
        return this.cache.get(key);
    }

    // 删除缓存
    delete(key) {
        return this.cache.del(key);
    }

    // 清空缓存
    clear() {
        return this.cache.flushAll();
    }

    // 获取缓存统计
    getStats() {
        return this.cache.getStats();
    }
}

module.exports = new CacheService();
