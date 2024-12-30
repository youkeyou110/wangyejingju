const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Template = require('../src/models/template.model');
const jwt = require('jsonwebtoken');
const config = require('../src/config/config');

describe('模板 API 测试', () => {
    let token;
    let userId;
    let templateId;

    beforeAll(async () => {
        // 连接测试数据库
        await mongoose.connect(config.mongoUri + '_test');

        // 创建测试用户
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        userId = user._id;
        token = jwt.sign({ userId }, config.jwtSecret);
    });

    afterAll(async () => {
        // 清理数据库
        await User.deleteMany();
        await Template.deleteMany();
        await mongoose.connection.close();
    });

    describe('创建模板', () => {
        it('应该成功创建模板', async () => {
            const res = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: '测试模板',
                    description: '这是一个测试模板',
                    thumbnail: 'http://example.com/thumb.png',
                    style: {
                        width: '800px',
                        height: '400px'
                    },
                    content: {
                        layout: 'center'
                    }
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            templateId = res.body.data._id;
        });
    });

    describe('获取模板列表', () => {
        it('应该返回模板列表', async () => {
            const res = await request(app)
                .get('/api/templates/market')
                .query({ page: 1, limit: 10 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('templates');
            expect(res.body.data).toHaveProperty('totalPages');
            expect(res.body.data).toHaveProperty('currentPage');
        });
    });

    describe('搜索模板', () => {
        it('应该返回搜索结果', async () => {
            const res = await request(app)
                .get('/api/templates/search')
                .query({ keyword: '测试', page: 1, limit: 10 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.templates).toBeInstanceOf(Array);
        });
    });

    describe('评分模板', () => {
        it('应该成功评分模板', async () => {
            const res = await request(app)
                .post(`/api/templates/${templateId}/rate`)
                .set('Authorization', `Bearer ${token}`)
                .send({ score: 5 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.rating.score).toBe(5);
        });
    });

    describe('分享模板', () => {
        it('应该成功分享模板', async () => {
            const res = await request(app)
                .put(`/api/templates/${templateId}/share`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.isPublic).toBe(true);
        });
    });
});
