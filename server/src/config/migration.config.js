const path = require('path');

module.exports = {
    // 迁移文件存放路径
    migrationsDir: path.join(__dirname, '../migrations'),

    // 迁移记录集合名称
    collection: 'migrations',

    // 迁移文件模板
    template: `
        module.exports = {
            version: '{{version}}',
            description: '{{description}}',

            async up(db) {
                // 升级操作
            },

            async down(db) {
                // 回滚操作
            }
        };
    `,

    // 数据库配置
    mongodb: {
        url: process.env.MONGODB_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
};
