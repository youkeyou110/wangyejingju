module.exports = {
    version: '20240314000001',
    description: '创建用户集合',

    async up(db) {
        await db.createCollection('users', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: {
                            bsonType: 'string',
                            minLength: 3,
                            maxLength: 50
                        },
                        email: {
                            bsonType: 'string',
                            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
                        },
                        password: {
                            bsonType: 'string',
                            minLength: 6
                        },
                        settings: {
                            bsonType: 'object',
                            properties: {
                                theme: { bsonType: 'string' },
                                language: { bsonType: 'string' }
                            }
                        },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' }
                    }
                }
            }
        });

        // 创建索引
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
    },

    async down(db) {
        await db.collection('users').drop();
    }
};
