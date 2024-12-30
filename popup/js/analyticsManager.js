class AnalyticsManager {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
        this.metrics = new Map();
        this.events = [];
        this.maxEvents = 1000;
        this.flushInterval = 5 * 60 * 1000; // 5分钟
        this.initialized = false;
    }

    async initialize() {
        try {
            // 初始化指标收集
            this.initializeMetrics();

            // 设置定期上报
            this.setupAutoFlush();

            // 注册性能监听器
            this.setupPerformanceObservers();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'analyticsInitialize');
        }
    }

    trackEvent(category, action, label = null, value = null) {
        try {
            const event = {
                category,
                action,
                label,
                value,
                timestamp: new Date().toISOString()
            };

            this.events.push(event);

            // 如果事件数量超过限制，自动上报
            if (this.events.length >= this.maxEvents) {
                this.flush();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'trackEvent');
        }
    }

    trackMetric(name, value) {
        try {
            if (!this.metrics.has(name)) {
                this.metrics.set(name, []);
            }

            this.metrics.get(name).push({
                value,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            this.errorHandler.handleError(error, 'trackMetric');
        }
    }

    async flush() {
        if (!this.events.length && !this.metrics.size) {
            return;
        }

        try {
            const data = {
                events: [...this.events],
                metrics: Object.fromEntries(this.metrics)
            };

            const response = await fetch('https://api.example.com/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.events = [];
                this.metrics.clear();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'flushAnalytics');
        }
    }

    // 私有方法
    private initializeMetrics() {
        // 初始化基础指标
        this.metrics.set('performance', []);
        this.metrics.set('errors', []);
        this.metrics.set('usage', []);
    }

    private setupAutoFlush() {
        setInterval(() => {
            this.flush();
        }, this.flushInterval);

        // 页面卸载前尝试上报
        window.addEventListener('beforeunload', () => {
            this.flush();
        });
    }

    private setupPerformanceObservers() {
        // 监控长任务
        const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.trackMetric('longTask', entry.duration);
            });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // 监控资源加载
        const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.trackMetric(`resource_${entry.name}`, entry.duration);
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
    }
}

export default AnalyticsManager;
