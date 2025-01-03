import { version } from '../../package.json';
import storageManager from '../managers/StorageManager';

class UpdateManager {
    constructor() {
        this.currentVersion = version;
        this.migrations = new Map();
        this.setupMigrations();
    }

    // 设置迁移规则
    setupMigrations() {
        // 示例迁移：从1.0.0到1.1.0
        this.migrations.set('1.1.0', async () => {
            const settings = await storageManager.get('settings');
            if (settings) {
                // 添加新设置项
                settings.newFeature = true;
                await storageManager.set('settings', settings);
            }
        });

        // 从1.1.0到1.2.0
        this.migrations.set('1.2.0', async () => {
            // 重构数据结构
            const cards = await storageManager.get('cards');
            if (cards) {
                const newCards = cards.map(card => ({
                    ...card,
                    updatedAt: card.timestamp || Date.now()
                }));
                await storageManager.set('cards', newCards);
            }
        });
    }

    // 检查更新
    async checkForUpdates() {
        try {
            const lastVersion = await storageManager.get('version');
            if (!lastVersion) {
                // 首次安装
                await this.onFirstInstall();
                return;
            }

            if (lastVersion !== this.currentVersion) {
                // 版本更新
                await this.migrate(lastVersion, this.currentVersion);
            }
        } catch (error) {
            console.error('Update check failed:', error);
            // 可以添加错误报告机制
        }
    }

    // 首次安装
    async onFirstInstall() {
        try {
            // 初始化设置
            await storageManager.set('settings', {
                theme: 'light',
                autoSave: true,
                version: this.currentVersion
            });

            // 创建默认模板
            await storageManager.set('templates', [
                {
                    id: 'default',
                    name: '默认模板',
                    style: {
                        background: { type: 'solid', color: '#ffffff' },
                        font: { family: 'Arial', size: '16px', color: '#000000' }
                    }
                }
            ]);

            // 记录版本
            await storageManager.set('version', this.currentVersion);
        } catch (error) {
            console.error('First install failed:', error);
            // 可以添加错误恢复机制
        }
    }

    // 数据迁移
    async migrate(fromVersion, toVersion) {
        try {
            // 获取需要执行的迁移
            const migrations = Array.from(this.migrations.entries())
                .filter(([version]) => {
                    return semver.gt(version, fromVersion) &&
                           semver.lte(version, toVersion);
                })
                .sort(([a], [b]) => semver.compare(a, b));

            // 执行迁移
            for (const [version, migration] of migrations) {
                console.log(`Migrating to version ${version}...`);
                await migration();
            }

            // 更新版本记录
            await storageManager.set('version', toVersion);

            // 发送更新通知
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: '扩展已更新',
                message: `已更新到版本 ${toVersion}，点击查看更新内容。`
            });
        } catch (error) {
            console.error('Migration failed:', error);
            // 可以添加回滚机制
            await this.rollback(fromVersion);
        }
    }

    // 回滚机制
    async rollback(toVersion) {
        try {
            // 恢复数据备份
            const backup = await storageManager.get(`backup_${toVersion}`);
            if (backup) {
                await storageManager.clear();
                await storageManager.set('backup', backup);
                await storageManager.set('version', toVersion);
            }

            // 发送回滚通知
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: '更新失败',
                message: '已回滚到之前的版本。'
            });
        } catch (error) {
            console.error('Rollback failed:', error);
            // 可以添加紧急恢复机制
        }
    }
}

export default new UpdateManager();
