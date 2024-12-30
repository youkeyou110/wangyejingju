const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class UserController {
    // 用户注册
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // 检查用户是否已存在
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '用户名或邮箱已存在'
                });
            }

            // 创建新用户
            const user = new User({ username, email, password });
            await user.save();

            // 生成令牌
            const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
                expiresIn: config.jwtExpiration
            });

            res.status(201).json({
                success: true,
                message: '注册成功',
                data: {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '注册失败',
                error: error.message
            });
        }
    }

    // 用户登录
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // 查找用户
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '用户名或密码错误'
                });
            }

            // 验证密码
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: '用户名或密码错误'
                });
            }

            // 生成令牌
            const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
                expiresIn: config.jwtExpiration
            });

            res.json({
                success: true,
                message: '登录成功',
                data: {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '登录失败',
                error: error.message
            });
        }
    }

    // 获取用户信息
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.userId)
                .select('-password')
                .populate('templates');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取用户信息失败',
                error: error.message
            });
        }
    }

    // 更新用户设置
    async updateSettings(req, res) {
        try {
            const { settings } = req.body;
            const user = await User.findByIdAndUpdate(
                req.userId,
                { settings },
                { new: true }
            ).select('-password');

            res.json({
                success: true,
                message: '设置更新成功',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '更新设置失败',
                error: error.message
            });
        }
    }
}

module.exports = new UserController();
