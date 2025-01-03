// 基础错误类
export class BaseError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.timestamp = Date.now();
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

// 系统错误
export class SystemError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'SYSTEM_ERROR', details);
    }
}

// 业务错误
export class BusinessError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'BUSINESS_ERROR', details);
    }
}

// 网络错误
export class NetworkError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'NETWORK_ERROR', details);
    }
}

// 用户错误
export class UserError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'USER_ERROR', details);
    }
}

// 存储错误
export class StorageError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'STORAGE_ERROR', details);
    }
}

// 验证错误
export class ValidationError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'VALIDATION_ERROR', details);
    }
}

// 权限错误
export class PermissionError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'PERMISSION_ERROR', details);
    }
}

// 配置错误
export class ConfigError extends BaseError {
    constructor(message, details = {}) {
        super(message, 'CONFIG_ERROR', details);
    }
}
