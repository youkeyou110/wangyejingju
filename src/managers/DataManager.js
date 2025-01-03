import { EventEmitter } from 'events';

class DataManager extends EventEmitter {
    constructor() {
        super();
        this.store = new Map();
        this.middlewares = [];
        this.errorHandlers = new Set();
        this.setupErrorHandling();
    }

    // 中间件系统
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        this.middlewares.push(middleware);
        return this;
    }

    // 错误处理
    onError(handler) {
        this.errorHandlers.add(handler);
        return () => this.errorHandlers.delete(handler);
    }

    // 设置数据
    async set(key, value, options = {}) {
        try {
            // 执行中间件
            const context = { key, value, options, type: 'set' };
            await this.runMiddlewares(context);

            // 存储数据
            this.store.set(key, {
                value: context.value,
                metadata: {
                    timestamp: Date.now(),
                    ...options
                }
            });

            // 触发事件
            this.emit('change', {
                type: 'set',
                key,
                value: context.value
            });

            return true;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    // 获取数据
    async get(key, defaultValue = null) {
        try {
            const data = this.store.get(key);
            if (!data) return defaultValue;

            // 执行中间件
            const context = {
                key,
                value: data.value,
                metadata: data.metadata,
                type: 'get'
            };
            await this.runMiddlewares(context);

            return context.value;
        } catch (error) {
            this.handleError(error);
            return defaultValue;
        }
    }

    // 删除数据
    async delete(key) {
        try {
            // 执行中间件
            const context = { key, type: 'delete' };
            await this.runMiddlewares(context);

            const result = this.store.delete(key);
            if (result) {
                this.emit('change', {
                    type: 'delete',
                    key
                });
            }
            return result;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    // 查询数据
    async query(filter) {
        try {
            const results = [];
            for (const [key, data] of this.store) {
                if (this.matchFilter(data, filter)) {
                    results.push({
                        key,
                        value: data.value,
                        metadata: data.metadata
                    });
                }
            }
            return results;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    // 批量操作
    async batch(operations) {
        try {
            const results = [];
            for (const op of operations) {
                let result;
                switch (op.type) {
                    case 'set':
                        result = await this.set(op.key, op.value, op.options);
                        break;
                    case 'delete':
                        result = await this.delete(op.key);
                        break;
                    default:
                        throw new Error(`Unknown operation type: ${op.type}`);
                }
                results.push(result);
            }
            return results;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    // 订阅变更
    subscribe(callback) {
        this.on('change', callback);
        return () => this.off('change', callback);
    }

    // 内部方法：运行中间件
    async runMiddlewares(context) {
        for (const middleware of this.middlewares) {
            await middleware(context);
        }
    }

    // 内部方法：匹配过滤器
    matchFilter(data, filter) {
        if (!filter) return true;

        for (const [key, value] of Object.entries(filter)) {
            if (typeof value === 'function') {
                if (!value(data.value[key])) return false;
            } else if (data.value[key] !== value) {
                return false;
            }
        }
        return true;
    }

    // 内部方法：错误处理
    handleError(error) {
        if (this.errorHandlers.size === 0) {
            console.error('Unhandled DataManager error:', error);
            return;
        }

        for (const handler of this.errorHandlers) {
            try {
                handler(error);
            } catch (handlerError) {
                console.error('Error in error handler:', handlerError);
            }
        }
    }

    // 内部方法：设置错误处理
    setupErrorHandling() {
        this.on('error', error => {
            this.handleError(error);
        });
    }
}

export default new DataManager();
