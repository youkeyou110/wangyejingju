import eventBus from '../managers/EventBusManager';

// 创建命名空间
export const createNamespace = (namespace) => {
    return {
        emit: (event, data, options = {}) =>
            eventBus.emit(event, data, { ...options, namespace }),

        on: (event, handler, options = {}) =>
            eventBus.on(event, handler, { ...options, namespace }),

        once: (event, handler, options = {}) =>
            eventBus.once(event, handler, { ...options, namespace }),

        clearCache: () =>
            eventBus.clearCache(namespace),

        getHandlerCount: (event) =>
            eventBus.getHandlerCount(event, namespace)
    };
};

// 批量订阅
export const batchSubscribe = (events, handler, options = {}) => {
    const unsubscribes = events.map(event =>
        eventBus.on(event, handler, options)
    );

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
};

// 事件过滤器
export const createEventFilter = (predicate) => {
    return (event, handler, options = {}) => {
        return eventBus.on(event, async (data, context) => {
            if (predicate(data, context)) {
                return handler(data, context);
            }
        }, options);
    };
};

// 事件转换器
export const createEventTransformer = (transformer) => {
    return (event, handler, options = {}) => {
        return eventBus.on(event, async (data, context) => {
            const transformedData = await transformer(data, context);
            return handler(transformedData, context);
        }, options);
    };
};

// 事件组合器
export const combineEvents = (events, options = {}) => {
    return new Promise((resolve, reject) => {
        const results = new Map();
        let completed = 0;
        const { timeout } = options;

        const checkComplete = () => {
            if (completed === events.length) {
                resolve(Array.from(results.values()));
            }
        };

        events.forEach((event, index) => {
            eventBus.once(event, (data, context) => {
                results.set(index, { data, context });
                completed++;
                checkComplete();
            }, options);
        });

        if (timeout) {
            setTimeout(() => {
                if (completed < events.length) {
                    reject(new Error('Event combination timeout'));
                }
            }, timeout);
        }
    });
};

// 事件队列
export const createEventQueue = () => {
    const queue = [];
    let isProcessing = false;

    const processQueue = async () => {
        if (isProcessing || queue.length === 0) return;
        isProcessing = true;

        try {
            const { event, data, options, resolve, reject } = queue.shift();
            const result = await eventBus.emit(event, data, options);
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            isProcessing = false;
            processQueue();
        }
    };

    return {
        emit: (event, data, options = {}) => {
            return new Promise((resolve, reject) => {
                queue.push({ event, data, options, resolve, reject });
                processQueue();
            });
        },
        clear: () => {
            queue.length = 0;
        },
        size: () => queue.length
    };
};
