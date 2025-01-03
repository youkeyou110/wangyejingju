import { EventEmitter } from 'events';
import logManager from './LogManager';
import cryptoManager from './CryptoManager';

class DataSecurityManager extends EventEmitter {
    constructor() {
        super();
        this.config = {
            backupInterval: 24 * 60 * 60 * 1000, // 24小时
            maxBackupSize: 100 * 1024 * 1024, // 100MB
            retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30天
            sensitiveFields: ['password', 'token', 'key', 'secret']
        };
        this.setupBackupSchedule();
    }

    // 设置备份计划
    setupBackupSchedule() {
        setInterval(() => {
            this.createBackup();
        }, this.config.backupInterval);
    }

    // 存储数据
    async storeData(key, data, options = {}) {
        try {
            // 处理敏感数据
            const processedData = this.processSensitiveData(data);

            // 加密数据
            const encryptedData = await cryptoManager.encrypt(processedData);

            // 存储加密数据
            await chrome.storage.local.set({
                [key]: {
                    data: encryptedData,
                    metadata: {
                        timestamp: Date.now(),
                        version: '1.0',
                        ...options
                    }
                }
            });

            this.emit('dataStored', { key });
        } catch (error) {
            logManager.error('Failed to store data:', error);
            throw error;
        }
    }

    // 读取数据
    async retrieveData(key) {
        try {
            const result = await chrome.storage.local.get(key);
            if (!result[key]) {
                return null;
            }

            // 解密数据
            const decryptedData = await cryptoManager.decrypt(result[key].data);

            // 恢复敏感数据
            return this.restoreSensitiveData(decryptedData);
        } catch (error) {
            logManager.error('Failed to retrieve data:', error);
            throw error;
        }
    }

    // 处理敏感数据
    processSensitiveData(data) {
        if (typeof data !== 'object') {
            return data;
        }

        const processed = { ...data };
        for (const field of this.config.sensitiveFields) {
            if (processed[field]) {
                processed[field] = cryptoManager.hash(processed[field]);
            }
        }

        return processed;
    }

    // 恢复敏感数据
    restoreSensitiveData(data) {
        // 实际应用中，这里需要实现敏感数据的恢复逻辑
        return data;
    }

    // 创建备份
    async createBackup() {
        try {
            const data = await this.getAllData();
            const backup = {
                timestamp: Date.now(),
                data: await cryptoManager.encrypt(data)
            };

            await this.storeBackup(backup);
            this.emit('backupCreated', { timestamp: backup.timestamp });

            // 清理旧备份
            await this.cleanupOldBackups();
        } catch (error) {
            logManager.error('Backup creation failed:', error);
            throw error;
        }
    }

    // 存储备份
    async storeBackup(backup) {
        try {
            const backups = await this.getBackups();
            backups.push(backup);

            await chrome.storage.local.set({ backups });
        } catch (error) {
            logManager.error('Failed to store backup:', error);
            throw error;
        }
    }

    // 获取所有备份
    async getBackups() {
        try {
            const result = await chrome.storage.local.get('backups');
            return result.backups || [];
        } catch (error) {
            logManager.error('Failed to get backups:', error);
            throw error;
        }
    }

    // 清理旧备份
    async cleanupOldBackups() {
        try {
            const backups = await this.getBackups();
            const now = Date.now();

            const validBackups = backups.filter(backup =>
                now - backup.timestamp < this.config.retentionPeriod
            );

            await chrome.storage.local.set({ backups: validBackups });
        } catch (error) {
            logManager.error('Failed to cleanup old backups:', error);
            throw error;
        }
    }

    // 获取所有数据
    async getAllData() {
        try {
            return await chrome.storage.local.get(null);
        } catch (error) {
            logManager.error('Failed to get all data:', error);
            throw error;
        }
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}

export default new DataSecurityManager();
