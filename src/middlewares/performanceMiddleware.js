import performanceMonitor from '../managers/PerformanceMonitor';

// 性能监控中间件
export const performanceMiddleware = async (context, next) => {
    const startTime = performance.now();
    const startMemory = performance.memory?.usedJSHeapSize;

    try {
        // 执行操作
        await next();

        // 记录性能指标
        const endTime = performance.now();
        const endMemory = performance.memory?.usedJSHeapSize;

        // 更新指标
        performanceMonitor.updateMetric('operation.duration', endTime - startTime, {
            operation: context.type,
            path: context.path
        });

        if (startMemory && endMemory) {
            performanceMonitor.updateMetric('operation.memory', endMemory - startMemory, {
                operation: context.type,
                path: context.path
            });
        }
    } catch (error) {
        // 记录错误性能指标
        performanceMonitor.updateMetric('operation.error', {
            operation: context.type,
            path: context.path,
            error: error.message
        });
        throw error;
    }
};

// 资源加载监控中间件
export const resourceLoadingMiddleware = async (context, next) => {
    if (context.type === 'resource') {
        const startTime = performance.now();

        try {
            await next();

            const endTime = performance.now();
            performanceMonitor.updateMetric('resource.loadTime', endTime - startTime, {
                resource: context.url,
                type: context.resourceType
            });
        } catch (error) {
            performanceMonitor.updateMetric('resource.error', {
                resource: context.url,
                type: context.resourceType,
                error: error.message
            });
            throw error;
        }
    } else {
        await next();
    }
};

// 渲染性能监控中间件
export const renderingMiddleware = async (context, next) => {
    if (context.type === 'render') {
        const startTime = performance.now();
        let frames = 0;
        let rafId;

        const countFrame = () => {
            frames++;
            rafId = requestAnimationFrame(countFrame);
        };
        rafId = requestAnimationFrame(countFrame);

        try {
            await next();

            cancelAnimationFrame(rafId);
            const endTime = performance.now();
            const duration = endTime - startTime;

            performanceMonitor.updateMetric('render.performance', {
                duration,
                fps: frames * 1000 / duration,
                component: context.component
            });
        } catch (error) {
            cancelAnimationFrame(rafId);
            performanceMonitor.updateMetric('render.error', {
                component: context.component,
                error: error.message
            });
            throw error;
        }
    } else {
        await next();
    }
};

// 用户交互监控中间件
export const interactionMiddleware = async (context, next) => {
    if (context.type === 'interaction') {
        const startTime = performance.now();

        try {
            await next();

            const endTime = performance.now();
            performanceMonitor.updateMetric('interaction.latency', endTime - startTime, {
                type: context.interactionType,
                target: context.target
            });
        } catch (error) {
            performanceMonitor.updateMetric('interaction.error', {
                type: context.interactionType,
                target: context.target,
                error: error.message
            });
            throw error;
        }
    } else {
        await next();
    }
};
