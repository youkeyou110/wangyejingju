const fs = require('fs').promises;
const path = require('path');
const config = require('../config/migration.config');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class MigrationService {
    constructor() {
        this.migrations = new Map();
        this.migrationModel = mongoose.model('Migration', {
            version: String,
            description: String,
            appliedAt: Date
        }, config.collection);
    }

    // 加载所有迁移文件
    async loadMigrations() {
        const files = await fs.readdir(config.migrationsDir);

        for (const file of files) {
            if (file.endsWith('.js')) {
                const migration = require(path.join(config.migrationsDir, file));
                this.migrations.set(migration.version, migration);
            }
        }
    }

    // 获取已应用的迁移
    async getAppliedMigrations() {
        return this.migrationModel.find().sort({ version: 1 });
    }

    // 创建新的迁移文件
    async createMigration(version, description) {
        const template = config.template
            .replace('{{version}}', version)
            .replace('{{description}}', description);

        const filename = `${version}_${description.toLowerCase().replace(/\s+/g, '_')}.js`;
        const filepath = path.join(config.migrationsDir, filename);

        await fs.writeFile(filepath, template);
        logger.info(`Created migration file: ${filename}`);
    }

    // 执行升级
    async up(targetVersion = null) {
        await this.loadMigrations();
        const applied = await this.getAppliedMigrations();
        const appliedVersions = new Set(applied.map(m => m.version));

        // 获取需要执行的迁移
        const pending = Array.from(this.migrations.entries())
            .filter(([version]) => !appliedVersions.has(version))
            .sort(([a], [b]) => a.localeCompare(b));

        if (targetVersion) {
            const targetIndex = pending.findIndex(([version]) => version === targetVersion);
            if (targetIndex !== -1) {
                pending.splice(targetIndex + 1);
            }
        }

        // 执行迁移
        for (const [version, migration] of pending) {
            try {
                logger.info(`Applying migration: ${version}`);
                await migration.up(mongoose.connection.db);

                await this.migrationModel.create({
                    version,
                    description: migration.description,
                    appliedAt: new Date()
                });

                logger.info(`Successfully applied migration: ${version}`);
            } catch (error) {
                logger.error(`Failed to apply migration ${version}: ${error.message}`);
                throw error;
            }
        }
    }

    // 执行回滚
    async down(targetVersion) {
        await this.loadMigrations();
        const applied = await this.getAppliedMigrations();

        // 获取需要回滚的迁移
        const toRollback = applied
            .filter(m => m.version > targetVersion)
            .sort((a, b) => b.version.localeCompare(a.version));

        // 执行回滚
        for (const migration of toRollback) {
            try {
                logger.info(`Rolling back migration: ${migration.version}`);
                const migrationScript = this.migrations.get(migration.version);
                await migrationScript.down(mongoose.connection.db);

                await this.migrationModel.deleteOne({ version: migration.version });
                logger.info(`Successfully rolled back migration: ${migration.version}`);
            } catch (error) {
                logger.error(`Failed to rollback migration ${migration.version}: ${error.message}`);
                throw error;
            }
        }
    }
}

module.exports = new MigrationService();
