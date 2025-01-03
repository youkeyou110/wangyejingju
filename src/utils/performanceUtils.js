import performanceMonitor from '../managers/PerformanceMonitor';

// 测量执行时间
export const measureExecutionTime = async (fn, context = {}) => {
    const startTime = performance.now();
    try {
        const result = await fn();
        const endTime = performance.now();

        performanceMonitor.updateMetric('execution.time', endTime - startTime, {
            ...context,
            success: true
        });

        return result;
    } catch (error) {
        const endTime = performance.now();

        performanceMonitor.updateMetric('execution.time', endTime - startTime, {
            ...context,
            success: false,
            error: error.message
        });

        throw error;
    }
};

// 监控内存使用
export const trackMemoryUsage = (fn) => {
    return async (...args) => {
        const startMemory = performance.memory?.usedJSHeapSize;
        try {
            const result = await fn(...args);
            const endMemory = performance.memory?.usedJSHeapSize;

            if (startMemory && endMemory) {
                performanceMonitor.updateMetric('memory.delta', endMemory - startMemory, {
                    function: fn.name,
                    args: args.length
                });
            }

            return result;
        } catch (error) {
            const endMemory = performance.memory?.usedJSHeapSize;

            if (startMemory && endMemory) {
                performanceMonitor.updateMetric('memory.error', endMemory - startMemory, {
                    function: fn.name,
                    error: error.message
                });
            }

            throw error;
        }
    };
};

// 监控渲染性能
export const trackRenderPerformance = (Component) => {
    return function PerformanceTrackedComponent(props) {
        const startTime = performance.now();
        let frames = 0;
        let rafId;

        const countFrame = () => {
            frames++;
            rafId = requestAnimationFrame(countFrame);
        };
        rafId = requestAnimationFrame(countFrame);

        useEffect(() => {
            return () => {
                cancelAnimationFrame(rafId);
                const endTime = performance.now();
                const duration = endTime - startTime;

                performanceMonitor.updateMetric('component.render', {
                    duration,
                    fps: frames * 1000 / duration,
                    component: Component.name
                });
            };
        }, []);

        return <Component {...props} />;
    };
};

// 监控资源加载
export const trackResourceLoading = async (url, options = {}) => {
    const startTime = performance.now();
    try {
        const response = await fetch(url, options);
        const endTime = performance.now();

        performanceMonitor.updateMetric('resource.load', endTime - startTime, {
            url,
            type: 'fetch',
            status: response.status
        });

        return response;
    } catch (error) {
        const endTime = performance.now();

        performanceMonitor.updateMetric('resource.error', endTime - startTime, {
            url,
            type: 'fetch',
            error: error.message
        });

        throw error;
    }
};

// 生成性能报告
export const generatePerformanceReport = () => {
    const metrics = performanceMonitor.getAllMetrics();
    const warnings = [];
    const recommendations = new Set();

    // 分析性能指标
    for (const [name, data] of Object.entries(metrics)) {
        switch (name) {
            case 'fps':
                if (data.value < 30) {
                    warnings.push(`Low FPS: ${data.value}`);
                    recommendations.add('Optimize rendering performance');
                    recommendations.add('Reduce DOM operations');
                }
                break;

            case 'memory.usage':
                if (data.value > 0.8) {
                    warnings.push(`High memory usage: ${data.value * 100}%`);
                    recommendations.add('Implement memory cleanup');
                    recommendations.add('Check for memory leaks');
                }
                break;

            case 'cpu.usage':
                if (data.value > 0.7) {
                    warnings.push(`High CPU usage: ${data.value * 100}%`);
                    recommendations.add('Optimize expensive computations');
                    recommendations.add('Consider using Web Workers');
                }
                break;

            case 'storage.usage':
                if (data.value > 0.9) {
                    warnings.push(`High storage usage: ${data.value * 100}%`);
                    recommendations.add('Implement data cleanup');
                    recommendations.add('Use compression for large data');
                }
                break;
        }
    }

    return {
        timestamp: Date.now(),
        metrics,
        warnings,
        recommendations: Array.from(recommendations)
    };
};
