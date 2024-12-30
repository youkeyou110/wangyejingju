module.exports = {
    version: '20240314000005',
    description: '创建监控相关集合',

    async up(db) {
        // 创建指标集合
        await db.createCollection('metrics', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['timestamp', 'type', 'value'],
                    properties: {
                        timestamp: {
                            bsonType: 'date'
                        },
                        type: {
                            bsonType: 'string'
                        },
                        value: {
                            bsonType: 'number'
                        },
                        metadata: {
                            bsonType: 'object'
                        }
                    }
                }
            }
        });

        // 创建告警集合
        await db.createCollection('alerts', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['timestamp', 'level', 'message'],
                    properties: {
                        timestamp: {
                            bsonType: 'date'
                        },
                        level: {
                            bsonType: 'string',
                            enum: ['error', 'warning', 'info']
                        },
                        message: {
                            bsonType: 'string'
                        },
                        metadata: {
                            bsonType: 'object'
                        },
                        status: {
                            bsonType: 'string',
                            enum: ['new', 'acknowledged', 'resolved']
                        }
                    }
                }
            }
        });

        // 创建索引
        await db.collection('metrics').createIndex(
            { timestamp: 1, type: 1 }
        );
        await db.collection('metrics').createIndex(
            { timestamp: 1 },
            { expireAfterSeconds: config.dashboard.retentionDays * 86400 }
        );
        await db.collection('alerts').createIndex(
            { timestamp: -1, level: 1, status: 1 }
        );
    },

    async down(db) {
        await db.collection('metrics').drop();
        await db.collection('alerts').drop();
    }
};
