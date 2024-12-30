#!/usr/bin/env node
const program = require('commander');
const MigrationService = require('../services/migration.service');
const logger = require('../utils/logger');

program
    .version('1.0.0')
    .description('数据库迁移工具');

// 创建新迁移
program
    .command('create <description>')
    .description('创建新的迁移文件')
    .action(async (description) => {
        try {
            const version = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
            await MigrationService.createMigration(version, description);
            process.exit(0);
        } catch (error) {
            logger.error(error);
            process.exit(1);
        }
    });

// 执行升级
program
    .command('up [version]')
    .description('执行数据库升级')
    .action(async (version) => {
        try {
            await MigrationService.up(version);
            process.exit(0);
        } catch (error) {
            logger.error(error);
            process.exit(1);
        }
    });

// 执行回滚
program
    .command('down <version>')
    .description('回滚到指定版本')
    .action(async (version) => {
        try {
            await MigrationService.down(version);
            process.exit(0);
        } catch (error) {
            logger.error(error);
            process.exit(1);
        }
    });

program.parse(process.argv);
