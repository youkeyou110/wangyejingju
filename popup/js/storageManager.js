class StorageManager {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
        this.syncInProgress = false;
        this.syncQueue = [];
        this.lastSyncTime = null;
    }

    async saveData(key, data) {
        try {
            // 本地存储
            await chrome.storage.local.set({ [key]: data });

            // 添加到同步队列
            this.addToSyncQueue({ key, data, operation: 'save' });

            // 触发同步
            this.triggerSync();

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'saveData', { key });
            throw error;
        }
    }

    async getData(key) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key];
        } catch (error) {
            this.errorHandler.handleError(error, 'getData', { key });
            throw error;
        }
    }

    async removeData(key) {
        try {
            await chrome.storage.local.remove(key);

            // 添加到同步队列
            this.addToSyncQueue({ key, operation: 'remove' });

            // 触发同步
            this.triggerSync();

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'removeData', { key });
            throw error;
        }
    }

    async clearData() {
        try {
            await chrome.storage.local.clear();

            // 添加到同步队列
            this.addToSyncQueue({ operation: 'clear' });

            // 触发同步
            this.triggerSync();

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'clearData');
            throw error;
        }
    }

    // 数据迁移
    async migrateData(version) {
        try {
            const currentVersion = await this.getData('dataVersion');

            if (currentVersion === version) {
                return true;
            }

            // 执行迁移逻辑
            switch (currentVersion) {
                case '1.0.0':
                    await this.migrateFrom100To110();
                    break;
                case '1.1.0':
                    await this.migrateFrom110To120();
                    break;
                default:
                    // 初始化��据
                    await this.initializeData(version);
            }

            // 更新版本号
            await this.saveData('dataVersion', version);

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'migrateData', { version });
            throw error;
        }
    }

    // 数据备份
    async backupData() {
        try {
            const data = await chrome.storage.local.get(null);
            const backup = {
                timestamp: new Date().toISOString(),
                data: data
            };

            // 创建备份文件
            const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // 下载备份文件
            chrome.downloads.download({
                url: url,
                filename: `backup-${backup.timestamp}.json`,
                saveAs: true
            });

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'backupData');
            throw error;
        }
    }

    // 恢复备份
    async restoreBackup(backupFile) {
        try {
            const backup = JSON.parse(await this.readFile(backupFile));

            // 验证备份数据
            if (!this.validateBackup(backup)) {
                throw new Error('Invalid backup file');
            }

            // 清除当前数据
            await this.clearData();

            // 恢复数据
            await chrome.storage.local.set(backup.data);

            // 触发同步
            this.addToSyncQueue({ operation: 'restore', data: backup.data });
            this.triggerSync();

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'restoreBackup');
            throw error;
        }
    }

    // 云端同步
    async syncWithCloud() {
        if (this.syncInProgress || this.syncQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;

        try {
            while (this.syncQueue.length > 0) {
                const operation = this.syncQueue.shift();
                await this.performCloudSync(operation);
            }

            this.lastSyncTime = new Date().toISOString();
            await this.saveData('lastSyncTime', this.lastSyncTime);
        } catch (error) {
            this.errorHandler.handleError(error, 'syncWithCloud');
            // 失败的操作重新加入队列
            this.syncQueue.unshift(operation);
        } finally {
            this.syncInProgress = false;
        }
    }

    // 私有方法
    private async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    private validateBackup(backup) {
        return backup
            && backup.timestamp
            && backup.data
            && typeof backup.data === 'object';
    }

    private addToSyncQueue(operation) {
        this.syncQueue.push({
            ...operation,
            timestamp: new Date().toISOString()
        });
    }

    private async triggerSync() {
        if (navigator.onLine) {
            this.syncWithCloud();
        }
    }

    private async performCloudSync(operation) {
        // 实现具体的云同步逻辑
        const response = await fetch('https://api.example.com/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(operation)
        });

        if (!response.ok) {
            throw new Error('Sync failed');
        }

        return await response.json();
    }

    private async migrateFrom100To110() {
        // 实现从 1.0.0 到 1.1.0 的迁移逻辑
    }

    private async migrateFrom110To120() {
        // 实现从 1.1.0 到 1.2.0 的迁移逻辑
    }

    private async initializeData(version) {
        // 实现数据初始化逻辑
        await this.saveData('settings', {
            theme: 'light',
            language: 'zh_CN',
            autoSync: true
        });
    }
}

export default StorageManager;
