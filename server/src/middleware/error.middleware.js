const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // 获取客户端语言偏好
    const lang = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'zh';

    // 记录错误日志
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        lang: lang,
        timestamp: new Date().toISOString()
    });

    // 如果是自定义错误，直接返回
    if (err instanceof AppError) {
        return res.status(err.status).json(err.toJSON());
    }

    // 处理 MongoDB 错误
    if (err.name === 'ValidationError') {
        const appError = new AppError('SYSTEM.DATABASE_ERROR', err.errors, lang);
        return res.status(400).json(appError.toJSON());
    }

    // 处理 JWT 错误
    if (err.name === 'JsonWebTokenError') {
        const appError = new AppError('AUTH.INVALID_TOKEN', null, lang);
        return res.status(401).json(appError.toJSON());
    }

    // 默认错误响应
    const appError = new AppError('SYSTEM.INTERNAL_ERROR',
        process.env.NODE_ENV === 'development' ? err.stack : undefined,
        lang
    );
    res.status(500).json(appError.toJSON());
};

module.exports = errorHandler;
