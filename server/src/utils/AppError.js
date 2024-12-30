const errorCodes = require('../config/error.config');
const errorMessages = require('../config/i18n/errors');

class AppError extends Error {
    constructor(errorType, details = null, lang = 'zh') {
        const error = this.getErrorConfig(errorType);
        const i18nError = this.getI18nError(errorType, lang);
        super(i18nError.message);

        this.code = error.code;
        this.details = details;
        this.status = this.getStatusCode(error.code);
        this.suggestion = i18nError.suggestion;

        Error.captureStackTrace(this, this.constructor);
    }

    getErrorConfig(errorType) {
        const [category, type] = errorType.split('.');
        return errorCodes[category][type];
    }

    getI18nError(errorType, lang) {
        const [category, type] = errorType.split('.');
        return errorMessages[lang][category][type] || {
            message: this.getErrorConfig(errorType).message,
            suggestion: null
        };
    }

    getStatusCode(code) {
        // 根据错误码确定 HTTP 状态码
        if (code >= 1000 && code < 2000) return 500;  // 系统错误
        if (code >= 2000 && code < 3000) return 401;  // 认证错误
        if (code >= 3000 && code < 4000) return 400;  // 用户错误
        if (code >= 4000 && code < 5000) return 404;  // 模板错误
        if (code >= 5000 && code < 6000) return 400;  // 文件错误
        return 500;  // 默认内部错误
    }

    toJSON() {
        return {
            success: false,
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
                suggestion: this.suggestion
            }
        };
    }
}

module.exports = AppError;
