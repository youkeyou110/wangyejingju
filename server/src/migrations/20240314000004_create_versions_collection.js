module.exports = {
    version: '20240314000004',
    description: '创建版本历史集合',

    async up(db) {
        await db.createCollection('versions', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['templateId', 'version', 'data'],
                    properties: {
                        templateId: {
                            bsonType: 'objectId'
                        },
                        version: {
                            bsonType: 'int',
                            minimum: 1
                        },
                        data: {
                            bsonType: 'object',
                            required: ['style', 'content'],
                            properties: {
                                style: { bsonType: 'object' },
                                content: { bsonType: 'object' }
                            }
                        },
                        comment: {
                            bsonType: 'string',
                            maxLength: 500
                        },
                        author: {
                            bsonType: 'objectId'
                        },
                        createdAt: { bsonType: 'date' },
                        changes: {
                            bsonType: 'object',
                            properties: {
                                added: { bsonType: 'object' },
                                modified: { bsonType: 'object' },
                                deleted: {
                                    bsonType: 'array',
                                    items: { bsonType: 'string' }
                                }
                            }
                        },
                        parent: {
                            bsonType: ['objectId', 'null']
                        },
                        branch: {
                            bsonType: 'object',
                            properties: {
                                name: { bsonType: 'string' },
                                isMain: { bsonType: 'bool' }
                            }
                        }
                    }
                }
            }
        });

        // 创建索引
        await db.collection('versions').createIndex(
            { templateId: 1, version: -1 }
        );
        await db.collection('versions').createIndex(
            { templateId: 1, version: 1 },
            { unique: true }
        );
        await db.collection('versions').createIndex(
            { templateId: 1, 'branch.name': 1 }
        );
    },

    async down(db) {
        await db.collection('versions').drop();
    }
};
