class SyncManager {
    constructor(storageManager, userManager, uiManager, errorHandler) {
        this.storageManager = storageManager;
        this.userManager = userManager;
        this.uiManager = uiManager;
        this.errorHandler = errorHandler;
        this.syncInterval = 5 * 60 * 1000; // 5分钟
        this.lastSyncTime = null;
        this.syncInProgress = false;
        this.initialized = false;
    }

    async initialize() {
        try {
            // 加载同步设置
            await this.loadSyncSettings();

            // 检查上次同步时间
            const lastSync = await this.storageManager.getData('lastSyncTime');
            if (lastSync) {
                this.lastSyncTime = new Date(lastSync);
            }

            // 设置自动同步
            this.setupAutoSync();

            // 绑定事件监听
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'syncInitialize');
        }
    }

    // 同步控制
    async startSync() {
        try {
            if (this.syncInProgress) {
                return false;
            }

            this.syncInProgress = true;
            this.uiManager.showNotification('正在同步...', 'info');

            // 检查登录状态
            if (!this.userManager.currentUser) {
                throw new Error('User not logged in');
            }

            // 获取本地数据
            const localData = await this.getLocalData();

            // 获取云端数据
            const cloudData = await this.getCloudData();

            // 合并数据
            const mergedData = await this.mergeData(localData, cloudData);

            // 保存合并后的数据
            await this.saveData(mergedData);

            // 更新同步时间
            this.lastSyncTime = new Date();
            await this.storageManager.saveData('lastSyncTime', this.lastSyncTime.toISOString());

            // 触发同步完成事件
            document.dispatchEvent(new CustomEvent('syncCompleted', {
                detail: { timestamp: this.lastSyncTime }
            }));

            this.uiManager.showNotification('同步完成', 'success');
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'startSync');
            this.uiManager.showNotification('同步失败', 'error');
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    async pauseSync() {
        try {
            // 暂停自动同步
            if (this.autoSyncInterval) {
                clearInterval(this.autoSyncInterval);
                this.autoSyncInterval = null;
            }

            // 保存设置
            await this.saveSyncSettings({ autoSync: false });

            this.uiManager.showNotification('自动同步已暂停', 'info');
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'pauseSync');
            return false;
        }
    }

    async resumeSync() {
        try {
            // 恢复自动同步
            this.setupAutoSync();

            // 保存设置
            await this.saveSyncSettings({ autoSync: true });

            this.uiManager.showNotification('自动同步已恢复', 'success');
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'resumeSync');
            return false;
        }
    }

    // 数据处理
    private async getLocalData() {
        try {
            const data = {
                templates: await this.storageManager.getData('userTemplates'),
                settings: await this.storageManager.getData('userSettings'),
                history: await this.storageManager.getData('userHistory')
            };
            return data;
        } catch (error) {
            this.errorHandler.handleError(error, 'getLocalData');
            throw error;
        }
    }

    private async getCloudData() {
        try {
            const response = await fetch('https://api.example.com/sync/data', {
                headers: {
                    'Authorization': `Bearer ${this.userManager.currentUser.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cloud data');
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getCloudData');
            throw error;
        }
    }

    private async mergeData(localData, cloudData) {
        try {
            const merged = {
                templates: {},
                settings: {},
                history: []
            };

            // 合并模板
            const allTemplateIds = new Set([
                ...Object.keys(localData.templates || {}),
                ...Object.keys(cloudData.templates || {})
            ]);

            for (const id of allTemplateIds) {
                const local = localData.templates?.[id];
                const cloud = cloudData.templates?.[id];

                if (!local) {
                    merged.templates[id] = cloud;
                } else if (!cloud) {
                    merged.templates[id] = local;
                } else {
                    // 使用最新的版本
                    merged.templates[id] = new Date(local.updatedAt) > new Date(cloud.updatedAt)
                        ? local
                        : cloud;
                }
            }

            // 合并设置
            merged.settings = {
                ...cloudData.settings,
                ...localData.settings
            };

            // 合并历史记录
            const allHistory = [
                ...(localData.history || []),
                ...(cloudData.history || [])
            ];

            // 按时间排序并去重
            merged.history = Array.from(new Set(
                allHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            ));

            return merged;
        } catch (error) {
            this.errorHandler.handleError(error, 'mergeData');
            throw error;
        }
    }

    private async saveData(data) {
        try {
            // 保存到本地
            await Promise.all([
                this.storageManager.saveData('userTemplates', data.templates),
                this.storageManager.saveData('userSettings', data.settings),
                this.storageManager.saveData('userHistory', data.history)
            ]);

            // 保存到云端
            const response = await fetch('https://api.example.com/sync/data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.userManager.currentUser.token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to save cloud data');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'saveData');
            throw error;
        }
    }

    // 设置管理
    private async loadSyncSettings() {
        try {
            const settings = await this.storageManager.getData('syncSettings');
            if (settings) {
                this.syncInterval = settings.interval || this.syncInterval;
                if (settings.autoSync === false) {
                    await this.pauseSync();
                }
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'loadSyncSettings');
        }
    }

    private async saveSyncSettings(settings) {
        try {
            const currentSettings = await this.storageManager.getData('syncSettings') || {};
            const newSettings = { ...currentSettings, ...settings };
            await this.storageManager.saveData('syncSettings', newSettings);
        } catch (error) {
            this.errorHandler.handleError(error, 'saveSyncSettings');
        }
    }

    private setupAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
        }

        this.autoSyncInterval = setInterval(() => {
            if (this.userManager.currentUser) {
                this.startSync();
            }
        }, this.syncInterval);
    }

    private setupEventListeners() {
        // 监听用户登录事件
        document.addEventListener('userLoggedIn', () => {
            this.startSync();
        });

        // 监听用户登出事件
        document.addEventListener('userLoggedOut', () => {
            this.pauseSync();
        });

        // 监听同步设置变更
        document.addEventListener('syncSettingsChanged', (e) => {
            const { interval } = e.detail;
            if (interval) {
                this.syncInterval = interval;
                this.setupAutoSync();
            }
        });
    }
}

export default SyncManager;
