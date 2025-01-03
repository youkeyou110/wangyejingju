import storageManager from '../managers/StorageManager';

// 数据压缩工具
export const compressData = async (data, options = {}) => {
    const {
        type = 'gzip',
        level = 6,
        threshold = 1024
    } = options;

    // 如果数据小于阈值，不压缩
    const size = new Blob([JSON.stringify(data)]).size;
    if (size < threshold) {
        return data;
    }

    try {
        switch (type) {
            case 'gzip':
                return await storageManager.compress(data);
            // 可以添加其他压缩算法
            default:
                return data;
        }
    } catch (error) {
        console.error('Data compression failed:', error);
        return data;
    }
};

// 数据解压工具
export const decompressData = async (data, type = 'gzip') => {
    try {
        switch (type) {
            case 'gzip':
                return await storageManager.decompress(data);
            // 可以添加其他解压算法
            default:
                return data;
        }
    } catch (error) {
        console.error('Data decompression failed:', error);
        return data;
    }
};

// 批量操作工具
export const batchOperation = async (keys, operation) => {
    const results = new Map();
    const errors = new Map();

    await Promise.all(
        keys.map(async key => {
            try {
                const result = await operation(key);
                results.set(key, result);
            } catch (error) {
                errors.set(key, error);
            }
        })
    );

    return { results, errors };
};

// 存储空间清理工具
export const cleanupStorage = async (options = {}) => {
    const {
        maxAge = 30 * 24 * 60 * 60 * 1000, // 30天
        maxSize = 100 * 1024 * 1024, // 100MB
        preserveTags = [], // 保留特定标签的数据
        dryRun = false // 是否仅预览而不实际删除
    } = options;

    const stats = await storageManager.getStats();
    const toDelete = [];

    // 如果总大小超过限制，清理旧数据
    if (stats.totalSize > maxSize) {
        const results = await storageManager.query({
            fromDate: 0,
            toDate: Date.now() - maxAge
        });

        for (const { key, metadata } of results) {
            // 跳过包含保留标签的数据
            if (preserveTags.some(tag => metadata.tags.includes(tag))) {
                continue;
            }
            toDelete.push(key);
        }
    }

    if (!dryRun && toDelete.length > 0) {
        const { results, errors } = await batchOperation(toDelete, key =>
            storageManager.remove(key)
        );

        return {
            deletedCount: results.size,
            errorCount: errors.size,
            freedSpace: Array.from(results.values())
                .reduce((total, result) => total + (result?.size || 0), 0)
        };
    }

    return {
        wouldDelete: toDelete.length,
        wouldFreeSpace: toDelete.reduce((total, key) => {
            const metadata = storageManager.index.get(storageManager.getFullKey(key));
            return total + (metadata?.size || 0);
        }, 0)
    };
};

// 存储监控工具
export const monitorStorage = (callback, interval = 5000) => {
    let lastStats = null;

    const check = async () => {
        const stats = await storageManager.getStats();

        if (lastStats) {
            const changes = {
                sizeChange: stats.totalSize - lastStats.totalSize,
                itemChange: stats.totalItems - lastStats.totalItems,
                newTypes: Object.keys(stats.typeStats)
                    .filter(type => !lastStats.typeStats[type]),
                newTags: Object.keys(stats.tagStats)
                    .filter(tag => !lastStats.tagStats[tag])
            };

            if (
                changes.sizeChange !== 0 ||
                changes.itemChange !== 0 ||
                changes.newTypes.length > 0 ||
                changes.newTags.length > 0
            ) {
                callback(stats, changes);
            }
        }

        lastStats = stats;
    };

    const timer = setInterval(check, interval);
    check(); // 立即执行首次检查

    return () => clearInterval(timer);
};
