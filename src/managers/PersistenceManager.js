import { EventEmitter } from 'events';
import { openDB } from 'idb';
import { compress, decompress } from '../utils/compression';
import logManager from './LogManager';

class PersistenceManager extends EventEmitter {
    constructor() {
        super();
        this.db = null;
        this.syncInProgress = false;
        this.pendingChanges = new Map();
        this.setupDatabase();
    }

    // 初始化数据库
    async setupDatabase() {
        try {
            this.db = await openDB('quote-card-generator', 1, {
                upgrade(db) {
                    // 创建数据存储
                    db.createObjectStore('data', { keyPath: 'id' });
                    db.createObjectStore('templates', { keyPath: 'id' });
                    db.createObjectStore('settings', { keyPath: 'key' });
                    db.createObjectStore('backups', { keyPath: 'timestamp' });
                }
            });

            this.emit('database:ready');
        } catch (error) {
            logManager.error('Database setup failed:', error);
            this.emit('database:error', error);
        }
    }

    // 保存数据
    async save(store, key, data, options = {}) {
        try {
            // 压缩数据
            const compressedData = options.compress ?
                await compress(data) : data;

            // 添加元数据
            const record = {
                id: key,
                data: compressedData,
                metadata: {
                    timestamp: Date.now(),
                    version: options.version || '1.0.0',
                    compressed: options.compress || false,
                    ...options.metadata
                }
            };

            // 存储数据
            await this.db.put(store, record);

            // 记录变更
            this.pendingChanges.set(`${store}:${key}`, record);

            // 触发事件
            this.emit('data:save', {
                store,
                key,
                metadata: record.metadata
            });

            // 自动同步
            if (options.autoSync) {
                await this.sync();
            }

            return true;
        } catch (error) {
            logManager.error('Data save failed:', error);
            this.emit('data:error', error);
            return false;
        }
    }

    // 加载数据
    async load(store, key, options = {}) {
        try {
            const record = await this.db.get(store, key);
            if (!record) {
                return options.defaultValue || null;
            }

            // 解压数据
            const data = record.metadata.compressed ?
                await decompress(record.data) : record.data;

            // 触发事件
            this.emit('data:load', {
                store,
                key,
                metadata: record.metadata
            });

            return data;
        } catch (error) {
            logManager.error('Data load failed:', error);
            this.emit('data:error', error);
            return options.defaultValue || null;
        }
    }

    // 删除数据
    async delete(store, key) {
        try {
            await this.db.delete(store, key);

            // 记录变更
            this.pendingChanges.set(`${store}:${key}`, null);

            // 触发事件
            this.emit('data:delete', {
                store,
                key
            });

            return true;
        } catch (error) {
            logManager.error('Data delete failed:', error);
            this.emit('data:error', error);
            return false;
        }
    }

    // 查询数据
    async query(store, filter = {}) {
        try {
            const records = await this.db.getAll(store);
            return records.filter(record => {
                for (const [key, value] of Object.entries(filter)) {
                    if (record[key] !== value) {
                        return false;
                    }
                }
                return true;
            });
        } catch (error) {
            logManager.error('Data query failed:', error);
            this.emit('data:error', error);
            return [];
        }
    }

    // 创建备份
    async backup() {
        try {
            const timestamp = Date.now();
            const stores = ['data', 'templates', 'settings'];
            const backup = {};

            // 导出所有数据
            for (const store of stores) {
                backup[store] = await this.db.getAll(store);
            }

            // 保存备份
            await this.db.put('backups', {
                timestamp,
                data: backup
            });

            // 触发事件
            this.emit('backup:create', {
                timestamp,
                stores
            });

            return timestamp;
        } catch (error) {
            logManager.error('Backup creation failed:', error);
            this.emit('backup:error', error);
            return null;
        }
    }

    // 恢复备份
    async restore(timestamp) {
        try {
            const backup = await this.db.get('backups', timestamp);
            if (!backup) {
                throw new Error('Backup not found');
            }

            // 恢复所有数据
            const tx = this.db.transaction(['data', 'templates', 'settings'], 'readwrite');
            for (const [store, data] of Object.entries(backup.data)) {
                const objectStore = tx.objectStore(store);
                await objectStore.clear();
                for (const record of data) {
                    await objectStore.put(record);
                }
            }
            await tx.done;

            // 触发事件
            this.emit('backup:restore', {
                timestamp,
                stores: Object.keys(backup.data)
            });

            return true;
        } catch (error) {
            logManager.error('Backup restoration failed:', error);
            this.emit('backup:error', error);
            return false;
        }
    }

    // 同步数据
    async sync() {
        if (this.syncInProgress) return;
        this.syncInProgress = true;

        try {
            // 获取待同步的变更
            const changes = Array.from(this.pendingChanges.entries())
                .map(([key, value]) => {
                    const [store, id] = key.split(':');
                    return { store, id, value };
                });

            if (changes.length === 0) {
                return true;
            }

            // 执行同步
            // TODO: 实现与云端的同步逻辑

            // 清理已同步的变更
            this.pendingChanges.clear();

            // 触发事件
            this.emit('sync:complete', {
                changesCount: changes.length
            });

            return true;
        } catch (error) {
            logManager.error('Data sync failed:', error);
            this.emit('sync:error', error);
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    // 数据迁移
    async migrate(fromVersion, toVersion) {
        try {
            // 获取所有数据
            const data = await this.db.getAll('data');
            const templates = await this.db.getAll('templates');
            const settings = await this.db.getAll('settings');

            // 执行迁移
            const migrated = {
                data: await this.migrateData(data, fromVersion, toVersion),
                templates: await this.migrateTemplates(templates, fromVersion, toVersion),
                settings: await this.migrateSettings(settings, fromVersion, toVersion)
            };

            // 保存迁移后的数据
            const tx = this.db.transaction(['data', 'templates', 'settings'], 'readwrite');
            for (const [store, records] of Object.entries(migrated)) {
                const objectStore = tx.objectStore(store);
                await objectStore.clear();
                for (const record of records) {
                    await objectStore.put(record);
                }
            }
            await tx.done;

            // 触发事件
            this.emit('migration:complete', {
                fromVersion,
                toVersion
            });

            return true;
        } catch (error) {
            logManager.error('Data migration failed:', error);
            this.emit('migration:error', error);
            return false;
        }
    }

    // 内部方法：数据迁移
    async migrateData(data, fromVersion, toVersion) {
        // TODO: 实现数据迁移逻辑
        return data;
    }

    // 内部方法：模板迁移
    async migrateTemplates(templates, fromVersion, toVersion) {
        // TODO: 实现模板迁移逻辑
        return templates;
    }

    // 内部方法：设置迁移
    async migrateSettings(settings, fromVersion, toVersion) {
        // TODO: 实现设置迁移逻辑
        return settings;
    }
}

export default new PersistenceManager();
