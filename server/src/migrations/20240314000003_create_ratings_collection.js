module.exports = {
    version: '20240314000003',
    description: '创建评分集合',

    async up(db) {
        await db.createCollection('ratings', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['userId', 'templateId', 'score'],
                    properties: {
                        userId: {
                            bsonType: 'objectId'
                        },
                        templateId: {
                            bsonType: 'objectId'
                        },
                        score: {
                            bsonType: 'number',
                            minimum: 1,
                            maximum: 5
                        },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' }
                    }
                }
            }
        });

        // 创建索引
        await db.collection('ratings').createIndex(
            { userId: 1, templateId: 1 },
            { unique: true }
        );
    },

    async down(db) {
        await db.collection('ratings').drop();
    }
};
