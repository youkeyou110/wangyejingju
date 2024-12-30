module.exports = {
    version: '20240314000002',
    description: '创建模板集合',

    async up(db) {
        await db.createCollection('templates', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'author', 'style', 'content'],
                    properties: {
                        name: {
                            bsonType: 'string',
                            minLength: 1,
                            maxLength: 100
                        },
                        description: {
                            bsonType: 'string',
                            maxLength: 500
                        },
                        author: {
                            bsonType: 'objectId'
                        },
                        thumbnail: {
                            bsonType: 'string'
                        },
                        style: {
                            bsonType: 'object',
                            required: ['width', 'height'],
                            properties: {
                                width: { bsonType: 'string' },
                                height: { bsonType: 'string' },
                                background: { bsonType: 'string' },
                                fontFamily: { bsonType: 'string' },
                                fontSize: { bsonType: 'string' },
                                color: { bsonType: 'string' }
                            }
                        },
                        content: {
                            bsonType: 'object',
                            required: ['layout'],
                            properties: {
                                layout: { bsonType: 'string' },
                                quote: { bsonType: 'string' },
                                author: { bsonType: 'string' },
                                source: { bsonType: 'string' }
                            }
                        },
                        isPublic: {
                            bsonType: 'bool',
                            default: false
                        },
                        rating: {
                            bsonType: 'object',
                            properties: {
                                score: { bsonType: 'number' },
                                count: { bsonType: 'number' }
                            }
                        },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' }
                    }
                }
            }
        });

        // 创建索引
        await db.collection('templates').createIndex({ author: 1 });
        await db.collection('templates').createIndex({ 'rating.score': -1 });
        await db.collection('templates').createIndex({ isPublic: 1 });
    },

    async down(db) {
        await db.collection('templates').drop();
    }
};
