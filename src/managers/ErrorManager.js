import { EventEmitter } from 'events';
import logManager from './LogManager';
import { BaseError } from '../errors/types';

class ErrorManager extends EventEmitter {
    constructor() {
        super();
        this.handlers = new Map();
        this.middlewares = [];
        this.setupDefaultHandlers();
    }

    // 注册错误处理器
    registerHandler(errorType, handler) {
        if (!this.handlers.has(errorType)) {
            this.handlers.set(errorType, new Set());
        }
        this.handlers.get(errorType).add(handler);
        return () => this.handlers.get(errorType).delete(handler);
    }

    // 添加中间件
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        this.middlewares.push(middleware);
        return this;
    }

    // 处理错误
    async handleError(error, context = {}) {
        try {
            // 标准化错误
            const normalizedError = this.normalizeError(error);

            // 运行中间件
            await this.runMiddlewares(normalizedError, context);

            // 记录错误日志
            this.logError(normalizedError);

            // 触发错误事件
            this.emit('error', normalizedError, context);

            // 查找并执行对应的处理器
            const handlers = this.handlers.get(normalizedError.name) ||
                           this.handlers.get('BaseError') ||
                           new Set();

            for (const handler of handlers) {
                await handler(normalizedError, context);
            }

            // 错误恢复
            await this.recover(normalizedError, context);

            return true;
        } catch (handlingError) {
            console.error('Error handling failed:', handlingError);
            return false;
        }
    }

    // 错误恢复
    async recover(error, context) {
        try {
            // 根据错误类型执行恢复策略
            switch (error.code) {
                case 'STORAGE_ERROR':
                    await this.recoverStorage(error, context);
                    break;
                case 'NETWORK_ERROR':
                    await this.recoverNetwork(error, context);
                    break;
                case 'SYSTEM_ERROR':
                    await this.recoverSystem(error, context);
                    break;
                // 可以添加其他恢复策略
            }
        } catch (recoveryError) {
            logManager.error('Recovery failed:', {
                originalError: error,
                recoveryError
            });
        }
    }

    // 内部方法：运行中间件
    async runMiddlewares(error, context) {
        for (const middleware of this.middlewares) {
            await middleware(error, context);
        }
    }

    // 内部方法：标准化错误
    normalizeError(error) {
        if (error instanceof BaseError) {
            return error;
        }

        // 转换原生错误
        if (error instanceof Error) {
            return new BaseError(error.message, 'UNKNOWN_ERROR', {
                originalError: error,
                stack: error.stack
            });
        }

        // 处理其他类型
        return new BaseError(
            typeof error === 'string' ? error : 'Unknown error',
            'UNKNOWN_ERROR',
            { originalValue: error }
        );
    }

    // 内部方法：记录错误日志
    logError(error) {
        logManager.error(error.message, {
            code: error.code,
            details: error.details,
            stack: error.stack
        });
    }

    // 内部方法：存储恢复
    async recoverStorage(error, context) {
        // 实现存储恢复逻辑
        // 例如：清理缓存、重试操作等
    }

    // 内部方法：网络恢复
    async recoverNetwork(error, context) {
        // 实现网络恢复逻辑
        // 例如：重新连接、重试请求等
    }

    // 内部方法：系统恢复
    async recoverSystem(error, context) {
        // 实现系统恢复逻辑
        // 例如：重启服务、清理资源等
    }

    // 内部方法：设置默认处理器
    setupDefaultHandlers() {
        // 基础错误处理器
        this.registerHandler('BaseError', (error) => {
            console.error('Unhandled error:', error);
        });

        // 系统错误处理器
        this.registerHandler('SystemError', async (error) => {
            // 可以添加系统错误特定处理逻辑
            // 例如：重启服务、通知管理员等
        });

        // 业务错误处理器
        this.registerHandler('BusinessError', async (error) => {
            // 可以添加业务错误特定处理逻辑
            // 例如：回滚事务、通知用户等
        });

        // 网络错误处理器
        this.registerHandler('NetworkError', async (error) => {
            // 可以添加网络错误特定处理逻辑
            // 例如：重试请求、切换线路等
        });
    }
}

export default new ErrorManager();
