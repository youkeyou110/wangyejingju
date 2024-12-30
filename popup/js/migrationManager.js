class MigrationManager {
    constructor(storageManager, errorHandler) {
        this.storageManager = storageManager;
        this.errorHandler = errorHandler;
        this.currentVersion = '1.0.0';
        this.migrations = new Map();
        this.registerMigrations();
    }

    async initialize() {
        try {
            const version = await this.storageManager.getData('dataVersion');
            if (!version) {
                // 首次安装，初始化数据
                await this.initializeData();
            } else if (version !== this.currentVersion) {
                // 需要迁移
                await this.migrate(version);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'migrationInitialize');
        }
    }

    async migrate(fromVersion) {
        try {
            const migrations = this.getMigrationPath(fromVersion, this.currentVersion);

            // 开始迁移前备份
            await this.backup();

            // 按顺序执行迁移
            for (const migration of migrations) {
                await migration.up();
            }

            // 更新版本号
            await this.storageManager.saveData('dataVersion', this.currentVersion);
        } catch (error) {
            // 迁移失败，尝试恢复备份
            await this.restore();
            this.errorHandler.handleError(error, 'migration');
            throw error;
        }
    }

    async backup() {
        try {
            const data = await this.storageManager.getData('templates');
            await this.storageManager.saveData('backup', {
                data,
                version: await this.storageManager.getData('dataVersion'),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            this.errorHandler.handleError(error, 'backup');
            throw error;
        }
    }

    async restore() {
        try {
            const backup = await this.storageManager.getData('backup');
            if (backup) {
                await this.storageManager.saveData('templates', backup.data);
                await this.storageManager.saveData('dataVersion', backup.version);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'restore');
            throw error;
        }
    }

    async export() {
        try {
            const data = await this.storageManager.getData('templates');
            const exportData = {
                data,
                version: this.currentVersion,
                timestamp: new Date().toISOString()
            };

            // 创建下载
            const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `template-backup-${exportData.timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            this.errorHandler.handleError(error, 'export');
            throw error;
        }
    }

    async import(file) {
        try {
            const content = await this.readFile(file);
            const importData = JSON.parse(content);

            // 验证导入数据
            if (!this.validateImportData(importData)) {
                throw new Error('Invalid import data');
            }

            // 如果版本不匹配，需要迁移
            if (importData.version !== this.currentVersion) {
                await this.migrate(importData.version);
            }

            // 导入数据
            await this.storageManager.saveData('templates', importData.data);
        } catch (error) {
            this.errorHandler.handleError(error, 'import');
            throw error;
        }
    }

    // 私有方法
    private registerMigrations() {
        // 注册迁移脚本
        this.migrations.set('1.0.0-1.1.0', {
            up: async () => {
                const data = await this.storageManager.getData('templates');
                // 迁移到1.1.0版本的逻辑
                const migratedData = this.migrateTo110(data);
                await this.storageManager.saveData('templates', migratedData);
            },
            down: async () => {
                const data = await this.storageManager.getData('templates');
                // 回滚到1.0.0版本的逻辑
                const rolledBackData = this.rollbackTo100(data);
                await this.storageManager.saveData('templates', rolledBackData);
            }
        });

        this.migrations.set('1.1.0-1.2.0', {
            up: async () => {
                const data = await this.storageManager.getData('templates');
                // 迁移到1.2.0版本的逻辑
                const migratedData = this.migrateTo120(data);
                await this.storageManager.saveData('templates', migratedData);
            },
            down: async () => {
                const data = await this.storageManager.getData('templates');
                // 回滚到1.1.0版本的逻辑
                const rolledBackData = this.rollbackTo110(data);
                await this.storageManager.saveData('templates', rolledBackData);
            }
        });
    }

    private getMigrationPath(fromVersion, toVersion) {
        const migrations = [];
        let currentVersion = fromVersion;

        while (currentVersion !== toVersion) {
            const nextVersion = this.getNextVersion(currentVersion);
            const migration = this.migrations.get(`${currentVersion}-${nextVersion}`);
            if (!migration) {
                throw new Error(`No migration path from ${currentVersion} to ${nextVersion}`);
            }
            migrations.push(migration);
            currentVersion = nextVersion;
        }

        return migrations;
    }

    private getNextVersion(version) {
        const versions = ['1.0.0', '1.1.0', '1.2.0'];
        const index = versions.indexOf(version);
        return versions[index + 1];
    }

    private async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    private validateImportData(data) {
        return data
            && data.version
            && data.timestamp
            && data.data
            && typeof data.data === 'object';
    }

    private async initializeData() {
        await this.storageManager.saveData('templates', {});
        await this.storageManager.saveData('dataVersion', this.currentVersion);
    }

    // 迁移逻辑
    private migrateTo110(data) {
        // 实现从1.0.0到1.1.0的迁移逻辑
        return data;
    }

    private migrateTo120(data) {
        // 实现从1.1.0到1.2.0的迁移逻辑
        return data;
    }

    private rollbackTo100(data) {
        // 实现回滚到1.0.0的逻辑
        return data;
    }

    private rollbackTo110(data) {
        // 实现回滚到1.1.0的逻辑
        return data;
    }
}

export default MigrationManager;
