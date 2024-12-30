const Template = require('../models/template.model');
const User = require('../models/user.model');

class TemplateController {
    // 创建模板
    async createTemplate(req, res) {
        try {
            const template = new Template({
                ...req.body,
                author: req.userId
            });
            await template.save();

            // 更新用户的模板列表
            await User.findByIdAndUpdate(req.userId, {
                $push: { templates: template._id }
            });

            res.status(201).json({
                success: true,
                message: '模板创建成功',
                data: template
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '创建模板失败',
                error: error.message
            });
        }
    }

    // 获取模板市场列表
    async getMarketTemplates(req, res) {
        try {
            const { page = 1, limit = 10, sort = '-rating.score' } = req.query;
            const query = { isPublic: true };

            const templates = await Template.find(query)
                .sort(sort)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('author', 'username');

            const count = await Template.countDocuments(query);

            res.json({
                success: true,
                data: {
                    templates,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取模板列表失败',
                error: error.message
            });
        }
    }

    // 搜索模板
    async searchTemplates(req, res) {
        try {
            const { keyword, page = 1, limit = 10 } = req.query;
            const query = {
                isPublic: true,
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ]
            };

            const templates = await Template.find(query)
                .sort('-rating.score')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('author', 'username');

            const count = await Template.countDocuments(query);

            res.json({
                success: true,
                data: {
                    templates,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '搜索模板失败',
                error: error.message
            });
        }
    }

    // 评分模板
    async rateTemplate(req, res) {
        try {
            const { templateId } = req.params;
            const { score } = req.body;

            const template = await Template.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: '模板不存在'
                });
            }

            // 更新评分
            template.rating.score = (template.rating.score * template.rating.count + score) / (template.rating.count + 1);
            template.rating.count += 1;
            await template.save();

            res.json({
                success: true,
                message: '评分成功',
                data: template
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '评分失败',
                error: error.message
            });
        }
    }

    // 分享/取消分享模板
    async toggleShare(req, res) {
        try {
            const { templateId } = req.params;
            const template = await Template.findOne({
                _id: templateId,
                author: req.userId
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: '模板不存在或无权限'
                });
            }

            template.isPublic = !template.isPublic;
            await template.save();

            res.json({
                success: true,
                message: template.isPublic ? '模板已分享' : '模板已取消分享',
                data: template
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '操作失败',
                error: error.message
            });
        }
    }
}

module.exports = new TemplateController();
