const jwt = require('jsonwebtoken');
const config = require('../config/config');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error('未提供认证令牌');
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: '认证失败',
            error: error.message
        });
    }
};

module.exports = auth;
