class PerformanceManager {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
        this.metrics = new Map();
        this.observers = new Map();
        this.resourceCache = new Map();
        this.debounceTimers = new Map();
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            // 初始化性能观察器
            this.initPerformanceObservers();

            // 初始化资源缓存
            this.initResourceCache();

            // 注册性能监听器
            this.registerPerformanceListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'performanceInit');
        }
    }

    // 性能监控
    measure(label, callback) {
        const startTime = performance.now();

        try {
            callback();
        } finally {
            const duration = performance.now() - startTime;
            this.recordMetric(label, duration);
        }
    }

    async measureAsync(label, promise) {
        const startTime = performance.now();

        try {
            const result = await promise;
            const duration = performance.now() - startTime;
            this.recordMetric(label, duration);
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordMetric(`${label}_error`, duration);
            throw error;
        }
    }

    // 代码分割
    async loadModule(modulePath) {
        try {
            const module = await import(/* webpackChunkName: "[request]" */ modulePath);
            return module.default;
        } catch (error) {
            this.errorHandler.handleError(error, 'loadModule', { modulePath });
            throw error;
        }
    }

    // 资源缓存
    async cacheResource(key, resource) {
        try {
            this.resourceCache.set(key, {
                data: resource,
                timestamp: Date.now()
            });
        } catch (error) {
            this.errorHandler.handleError(error, 'cacheResource', { key });
        }
    }

    getCachedResource(key) {
        return this.resourceCache.get(key)?.data;
    }

    // 防抖动
    debounce(key, callback, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        this.debounceTimers.set(key, setTimeout(() => {
            this.debounceTimers.delete(key);
            callback();
        }, delay));
    }

    // 节流
    throttle(key, callback, limit = 300) {
        if (!this.debounceTimers.has(key)) {
            callback();
            this.debounceTimers.set(key, setTimeout(() => {
                this.debounceTimers.delete(key);
            }, limit));
        }
    }

    // 懒加载
    observeIntersection(element, callback) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(element);
        return observer;
    }

    // 私有方法
    private initPerformanceObservers() {
        // 长任务观察器
        const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.recordMetric('longTask', entry.duration);
            });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longTask', longTaskObserver);

        // 资源加载观察器
        const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.recordMetric(`resource_${entry.name}`, entry.duration);
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
    }

    private initResourceCache() {
        // 定期清理过期缓存
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.resourceCache) {
                if (now - value.timestamp > 24 * 60 * 60 * 1000) { // 24小时过期
                    this.resourceCache.delete(key);
                }
            }
        }, 60 * 60 * 1000); // 每小时检查一次
    }

    private registerPerformanceListeners() {
        // 监听页面生命周期
        document.addEventListener('DOMContentLoaded', () => {
            this.recordMetric('domContentLoaded', performance.now());
        });

        window.addEventListener('load', () => {
            this.recordMetric('windowLoad', performance.now());
        });

        // 监听内存使用
        if (performance.memory) {
            setInterval(() => {
                this.recordMetric('jsHeapSize', performance.memory.usedJSHeapSize);
            }, 30000);
        }
    }

    private recordMetric(label, value) {
        if (!this.metrics.has(label)) {
            this.metrics.set(label, []);
        }

        const metrics = this.metrics.get(label);
        metrics.push({
            value,
            timestamp: Date.now()
        });

        // 只保留最近1000条记录
        if (metrics.length > 1000) {
            metrics.shift();
        }

        // 发送性能数据
        this.reportMetrics(label, value);
    }

    private async reportMetrics(label, value) {
        try {
            await fetch('https://api.example.com/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    label,
                    value,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('Failed to report metrics:', error);
        }
    }
}

export default PerformanceManager;
