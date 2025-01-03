import { EventEmitter } from 'events';
import logManager from './LogManager';
import performanceMonitor from './PerformanceMonitor';

class EventBusManager extends EventEmitter {
    constructor() {
        super();
        this.handlers = new Map();
        this.middlewares = [];
        this.eventCache = new Map();
        this.maxListeners = 100;
        this.setupErrorHandling();
    }

    // 注册事件处理器
    on(event, handler, options = {}) {
        const { namespace = 'default', priority = 0 } = options;
        const eventKey = `${namespace}:${event}`;

        if (!this.handlers.has(eventKey)) {
            this.handlers.set(eventKey, new Map());
        }

        const handlers = this.handlers.get(eventKey);
        const handlerId = this.generateHandlerId();

        handlers.set(handlerId, {
            handler,
            priority,
            options
        });

        // 检查监听器数量
        if (handlers.size > this.maxListeners) {
            logManager.warn('Possible memory leak detected', {
                event: eventKey,
                handlersCount: handlers.size
            });
        }

        // 返回取消函数
        return () => {
            handlers.delete(handlerId);
            if (handlers.size === 0) {
                this.handlers.delete(eventKey);
            }
        };
    }

    // 一次性事件
    once(event, handler, options = {}) {
        const unsubscribe = this.on(event, async (...args) => {
            unsubscribe();
            await handler(...args);
        }, options);
        return unsubscribe;
    }

    // 派发事件
    async emit(event, data, options = {}) {
        const startTime = performance.now();
        const { namespace = 'default', cache = false } = options;
        const eventKey = `${namespace}:${event}`;

        try {
            // 检查缓存
            if (cache && this.eventCache.has(eventKey)) {
                return this.eventCache.get(eventKey);
            }

            // 获取处理器
            const handlers = this.handlers.get(eventKey) || new Map();
            const sortedHandlers = Array.from(handlers.values())
                .sort((a, b) => b.priority - a.priority);

            // 创建事件上下文
            const context = {
                event,
                namespace,
                timestamp: Date.now(),
                data
            };

            // 运行中间件
            await this.runMiddlewares(context);

            // 执行处理器
            const results = await Promise.all(
                sortedHandlers.map(({ handler }) =>
                    this.executeHandler(handler, data, context)
                )
            );

            // 缓存结果
            if (cache) {
                this.eventCache.set(eventKey, results);
            }

            // 记录性能指标
            const endTime = performance.now();
            performanceMonitor.updateMetric('event.execution', endTime - startTime, {
                event: eventKey,
                handlersCount: handlers.size
            });

            return results;
        } catch (error) {
            logManager.error('Event emission failed:', {
                event: eventKey,
                error
            });
            throw error;
        }
    }

    // 添加中间件
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        this.middlewares.push(middleware);
        return this;
    }

    // 清除事件缓存
    clearCache(namespace) {
        if (namespace) {
            const prefix = `${namespace}:`;
            for (const key of this.eventCache.keys()) {
                if (key.startsWith(prefix)) {
                    this.eventCache.delete(key);
                }
            }
        } else {
            this.eventCache.clear();
        }
    }

    // 获取事件处理器数量
    getHandlerCount(event, namespace = 'default') {
        const eventKey = `${namespace}:${event}`;
        const handlers = this.handlers.get(eventKey);
        return handlers ? handlers.size : 0;
    }

    // 内部方法：生成处理器ID
    generateHandlerId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 内部方法：执行处理器
    async executeHandler(handler, data, context) {
        try {
            const startTime = performance.now();
            const result = await handler(data, context);
            const endTime = performance.now();

            // 记录性能指标
            performanceMonitor.updateMetric('handler.execution', endTime - startTime, {
                event: context.event,
                handler: handler.name
            });

            return result;
        } catch (error) {
            logManager.error('Handler execution failed:', {
                event: context.event,
                error
            });
            throw error;
        }
    }

    // 内部方法：运行中间件
    async runMiddlewares(context) {
        for (const middleware of this.middlewares) {
            await middleware(context);
        }
    }

    // 内部方法：设置错误处理
    setupErrorHandling() {
        this.on('error', (error) => {
            logManager.error('Event bus error:', error);
        }, { priority: 100 });
    }
}

export default new EventBusManager();
