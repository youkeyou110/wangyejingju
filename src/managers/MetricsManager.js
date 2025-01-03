import { EventEmitter } from 'events';
import logManager from './LogManager';

class MetricsManager extends EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        this.thresholds = new Map();
        this.baselines = new Map();
        this.budgets = new Map();
        this.setupDefaultThresholds();
    }

    // 设置默认阈值
    setupDefaultThresholds() {
        this.setThreshold('firstLoadTime', 2000);     // 2s
        this.setThreshold('interactionTime', 100);    // 100ms
        this.setThreshold('memoryUsage', 100 * 1024 * 1024); // 100MB
        this.setThreshold('fps', 60);                 // 60fps
        this.setThreshold('scriptTime', 50);          // 50ms
        this.setThreshold('layoutTime', 10);          // 10ms
        this.setThreshold('networkTime', 1000);       // 1s
    }

    // 收集性能指标
    async collectMetrics() {
        try {
            // 收集性能时间
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            this.recordMetric('firstLoadTime', loadTime);

            // 收集内存使用
            if (performance.memory) {
                this.recordMetric('memoryUsage', performance.memory.usedJSHeapSize);
            }

            // 收集FPS
            await this.measureFPS();

            // 收集交互时间
            this.measureInteractionTime();

            // 收集脚本执行时间
            this.measureScriptTime();

            // 收集布局时间
            this.measureLayoutTime();

            // 收集网络时间
            this.measureNetworkTime();

            // 触发指标更新事件
            this.emit('metricsUpdated', this.getMetrics());

            // 检查性能预算
            this.checkBudgets();

        } catch (error) {
            logManager.error('Failed to collect metrics:', error);
        }
    }

    // 记录指标
    recordMetric(name, value, context = {}) {
        const metric = {
            value,
            timestamp: Date.now(),
            context
        };

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        const metrics = this.metrics.get(name);
        metrics.push(metric);

        // 限制历史记录数量
        if (metrics.length > 1000) {
            metrics.shift();
        }

        // 检查阈值
        this.checkThreshold(name, value);
    }

    // 测量FPS
    async measureFPS() {
        let frames = 0;
        let lastTime = performance.now();

        const countFrame = () => {
            frames++;
        };

        const calculateFPS = () => {
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;
            const fps = Math.round((frames * 1000) / elapsed);

            this.recordMetric('fps', fps);

            frames = 0;
            lastTime = currentTime;
        };

        // 开始测量
        requestAnimationFrame(function measure() {
            countFrame();
            requestAnimationFrame(measure);
        });

        // 每秒计算一次FPS
        setInterval(calculateFPS, 1000);
    }

    // 测量交互时间
    measureInteractionTime() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'first-input') {
                    this.recordMetric('interactionTime', entry.duration);
                }
            }
        });

        observer.observe({ entryTypes: ['first-input'] });
    }

    // 测量脚本执行时间
    measureScriptTime() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure') {
                    this.recordMetric('scriptTime', entry.duration);
                }
            }
        });

        observer.observe({ entryTypes: ['measure'] });
    }

    // 测量布局时间
    measureLayoutTime() {
        let lastFrameTime = performance.now();

        requestAnimationFrame(function measure() {
            const currentFrameTime = performance.now();
            const layoutTime = currentFrameTime - lastFrameTime;

            this.recordMetric('layoutTime', layoutTime);
            lastFrameTime = currentFrameTime;

            requestAnimationFrame(measure.bind(this));
        }.bind(this));
    }

    // 测量网络时间
    measureNetworkTime() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'resource') {
                    this.recordMetric('networkTime', entry.duration, {
                        url: entry.name,
                        type: entry.initiatorType
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['resource'] });
    }

    // 设置阈值
    setThreshold(name, value) {
        this.thresholds.set(name, value);
    }

    // 检查阈值
    checkThreshold(name, value) {
        const threshold = this.thresholds.get(name);
        if (threshold && value > threshold) {
            this.emit('thresholdExceeded', {
                metric: name,
                value,
                threshold
            });
        }
    }

    // 设置基准
    setBaseline(name, value) {
        this.baselines.set(name, value);
    }

    // 设置预算
    setBudget(name, budget) {
        this.budgets.set(name, budget);
    }

    // 检查预算
    checkBudgets() {
        for (const [name, budget] of this.budgets) {
            const metrics = this.metrics.get(name);
            if (!metrics || metrics.length === 0) continue;

            const currentValue = metrics[metrics.length - 1].value;
            if (currentValue > budget) {
                this.emit('budgetExceeded', {
                    metric: name,
                    value: currentValue,
                    budget
                });
            }
        }
    }

    // 获取指标
    getMetrics(name) {
        if (name) {
            return this.metrics.get(name) || [];
        }
        return Object.fromEntries(this.metrics);
    }

    // 获取性能报告
    generateReport() {
        const report = {
            timestamp: Date.now(),
            metrics: {},
            thresholds: {},
            budgets: {},
            violations: []
        };

        // 收集指标数据
        for (const [name, metrics] of this.metrics) {
            if (metrics.length > 0) {
                const latest = metrics[metrics.length - 1];
                report.metrics[name] = {
                    current: latest.value,
                    average: this.calculateAverage(metrics),
                    trend: this.calculateTrend(metrics)
                };
            }
        }

        // 收集阈值数据
        for (const [name, threshold] of this.thresholds) {
            report.thresholds[name] = threshold;
        }

        // 收集预算数据
        for (const [name, budget] of this.budgets) {
            report.budgets[name] = budget;
        }

        return report;
    }

    // 计算平均值
    calculateAverage(metrics) {
        if (metrics.length === 0) return 0;
        const sum = metrics.reduce((acc, m) => acc + m.value, 0);
        return sum / metrics.length;
    }

    // 计算趋势
    calculateTrend(metrics) {
        if (metrics.length < 2) return 'stable';
        const last = metrics[metrics.length - 1].value;
        const prev = metrics[metrics.length - 2].value;
        const diff = last - prev;
        if (Math.abs(diff) < 0.1) return 'stable';
        return diff > 0 ? 'increasing' : 'decreasing';
    }
}

export default new MetricsManager();
