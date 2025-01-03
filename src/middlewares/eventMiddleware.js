import performanceMonitor from '../managers/PerformanceMonitor';
import logManager from '../managers/LogManager';

// 性能监控中间件
export const performanceMiddleware = async (context) => {
    const startTime = performance.now();

    context.on('complete', () => {
        const endTime = performance.now();
        performanceMonitor.updateMetric('event.total', endTime - startTime, {
            event: context.event,
            namespace: context.namespace
        });
    });
};

// 日志中间件
export const loggingMiddleware = async (context) => {
    logManager.debug('Event dispatched:', {
        event: context.event,
        namespace: context.namespace,
        data: context.data
    });

    context.on('complete', (results) => {
        logManager.debug('Event completed:', {
            event: context.event,
            results
        });
    });
};

// 验证中间件
export const validationMiddleware = async (context) => {
    if (!context.event) {
        throw new Error('Event name is required');
    }

    if (typeof context.event !== 'string') {
        throw new Error('Event name must be a string');
    }

    if (context.namespace && typeof context.namespace !== 'string') {
        throw new Error('Namespace must be a string');
    }
};

// 超时中间件
export const timeoutMiddleware = (timeout = 5000) => {
    return async (context) => {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Event timeout: ${context.event}`));
            }, timeout);
        });

        context.promise = Promise.race([
            context.promise,
            timeoutPromise
        ]);
    };
};

// 重试中间件
export const retryMiddleware = (maxRetries = 3, delay = 1000) => {
    return async (context) => {
        let attempts = 0;

        const retry = async () => {
            try {
                return await context.promise;
            } catch (error) {
                attempts++;
                if (attempts >= maxRetries) {
                    throw error;
                }

                await new Promise(resolve => setTimeout(resolve, delay));
                return retry();
            }
        };

        context.promise = retry();
    };
};

// 缓存中间件
export const cacheMiddleware = (ttl = 60000) => {
    const cache = new Map();

    return async (context) => {
        const key = `${context.namespace}:${context.event}`;
        const cached = cache.get(key);

        if (cached && Date.now() - cached.timestamp < ttl) {
            context.promise = Promise.resolve(cached.data);
            return;
        }

        const originalPromise = context.promise;
        context.promise = originalPromise.then(result => {
            cache.set(key, {
                timestamp: Date.now(),
                data: result
            });
            return result;
        });
    };
};
