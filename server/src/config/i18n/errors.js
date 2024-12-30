module.exports = {
    zh: {
        SYSTEM: {
            INTERNAL_ERROR: {
                message: '系统内部错误',
                suggestion: '请稍后重试，如果问题持续存在请联系支持团队'
            },
            SERVICE_UNAVAILABLE: {
                message: '服务暂时不可用',
                suggestion: '请检查网络连接或稍后重试'
            },
            DATABASE_ERROR: {
                message: '数据库操作失败',
                suggestion: '请重试操作，如果问题持续存在请联系管理员'
            }
        },
        AUTH: {
            INVALID_TOKEN: {
                message: '无效的认证令牌',
                suggestion: '请重新登录'
            },
            TOKEN_EXPIRED: {
                message: '认证令牌已过期',
                suggestion: '请重新登录以继续操作'
            }
        },
        // ... 其他错误类型
    },
    en: {
        SYSTEM: {
            INTERNAL_ERROR: {
                message: 'Internal system error',
                suggestion: 'Please try again later or contact support if the problem persists'
            },
            // ... 其他英文错误消息
        }
    }
};
