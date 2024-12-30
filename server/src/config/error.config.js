module.exports = {
    // 系统错误 (1000-1999)
    SYSTEM: {
        INTERNAL_ERROR: {
            code: 1000,
            message: '系统内部错误'
        },
        SERVICE_UNAVAILABLE: {
            code: 1001,
            message: '服务暂时不可用'
        },
        DATABASE_ERROR: {
            code: 1002,
            message: '数据库操作失败'
        }
    },

    // 认证错误 (2000-2999)
    AUTH: {
        INVALID_TOKEN: {
            code: 2000,
            message: '无效的认证令牌'
        },
        TOKEN_EXPIRED: {
            code: 2001,
            message: '认证令牌已过期'
        },
        UNAUTHORIZED: {
            code: 2002,
            message: '未经授权的访问'
        }
    },

    // 用户错误 (3000-3999)
    USER: {
        NOT_FOUND: {
            code: 3000,
            message: '用户不存在'
        },
        ALREADY_EXISTS: {
            code: 3001,
            message: '用户已存在'
        },
        INVALID_PASSWORD: {
            code: 3002,
            message: '密码错误'
        }
    },

    // 模板错误 (4000-4999)
    TEMPLATE: {
        NOT_FOUND: {
            code: 4000,
            message: '模板不存在'
        },
        CREATE_FAILED: {
            code: 4001,
            message: '创建模板失败'
        },
        UPDATE_FAILED: {
            code: 4002,
            message: '更新模板失败'
        }
    },

    // 文件错误 (5000-5999)
    FILE: {
        UPLOAD_FAILED: {
            code: 5000,
            message: '文件上传失败'
        },
        DOWNLOAD_FAILED: {
            code: 5001,
            message: '文件下载失败'
        },
        INVALID_TYPE: {
            code: 5002,
            message: '不支持的文件类型'
        }
    }
};
