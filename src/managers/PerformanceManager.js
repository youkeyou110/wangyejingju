class PerformanceManager {
    constructor(options = {}) {
        this.options = {
            sampleInterval: options.sampleInterval || 1000,
            maxSamples: options.maxSamples || 100,
            warningThresholds: {
                fps: 30,
                memory: 0.8, // 80%
                cpu: 0.7, // 70%
                loadTime: 3000, // 3s
                storageUsage: 0.9 // 90%
            },
            ...options
        };

        this.metrics = new Map();
        this.listeners = new Set();
        this.isMonitoring = false;
        this.warningHandlers = new Set();
    }

    // 开始监控
    start() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;

        // 监控FPS
        this.startFPSMonitoring();

        // 监控内存
        this.startMemoryMonitoring();

        // 监控CPU
        this.startCPUMonitoring();

        // 监控存储
        this.startStorageMonitoring();

        // 监控加载时间
        this.monitorLoadTime();
    }

    // 停止监控
    stop() {
        this.isMonitoring = false;
        this.clearTimers();
    }

    // 监控FPS
    startFPSMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            const now = performance.now();
            const delta = now - lastTime;

            if (delta >= 1000) {
                const fps = Math.round((frameCount * 1000) / delta);
                this.updateMetric('fps', fps);

                if (fps < this.options.warningThresholds.fps) {
                    this.emitWarning('fps', fps);
                }

                frameCount = 0;
                lastTime = now;
            }

            frameCount++;
            if (this.isMonitoring) {
                requestAnimationFrame(measureFPS);
            }
        };

        requestAnimationFrame(measureFPS);
    }

    // 监控内存
    startMemoryMonitoring() {
        const measureMemory = async () => {
            if (!this.isMonitoring) return;

            try {
                if (performance.memory) {
                    const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
                    const usage = usedJSHeapSize / totalJSHeapSize;

                    this.updateMetric('memory', {
                        used: usedJSHeapSize,
                        total: totalJSHeapSize,
                        usage
                    });

                    if (usage > this.options.warningThresholds.memory) {
                        this.emitWarning('memory', usage);
                    }
                }

                // 使用Performance API测量内存
                const estimate = await performance.measureUserAgentSpecificMemory?.();
                if (estimate) {
                    this.updateMetric('detailedMemory', estimate);
                }
            } catch (error) {
                console.error('Memory monitoring failed:', error);
            }

            setTimeout(measureMemory, this.options.sampleInterval);
        };

        measureMemory();
    }

    // 监控CPU
    startCPUMonitoring() {
        let lastTime = performance.now();
        let lastCPUTime = 0;

        const measureCPU = async () => {
            if (!this.isMonitoring) return;

            try {
                const now = performance.now();
                const timeDiff = now - lastTime;

                // 使用Performance API测量CPU时间
                const cpuTime = performance.now();
                const cpuDiff = cpuTime - lastCPUTime;

                const usage = cpuDiff / timeDiff;
                this.updateMetric('cpu', usage);

                if (usage > this.options.warningThresholds.cpu) {
                    this.emitWarning('cpu', usage);
                }

                lastTime = now;
                lastCPUTime = cpuTime;
            } catch (error) {
                console.error('CPU monitoring failed:', error);
            }

            setTimeout(measureCPU, this.options.sampleInterval);
        };

        measureCPU();
    }

    // 监控存储使用
    startStorageMonitoring() {
        const measureStorage = async () => {
            if (!this.isMonitoring) return;

            try {
                if (navigator.storage && navigator.storage.estimate) {
                    const estimate = await navigator.storage.estimate();
                    const usage = estimate.usage / estimate.quota;

                    this.updateMetric('storage', {
                        used: estimate.usage,
                        quota: estimate.quota,
                        usage
                    });

                    if (usage > this.options.warningThresholds.storageUsage) {
                        this.emitWarning('storage', usage);
                    }
                }
            } catch (error) {
                console.error('Storage monitoring failed:', error);
            }

            setTimeout(measureStorage, this.options.sampleInterval * 10); // 存储监控间隔可以更长
        };

        measureStorage();
    }

    // 监控加载时间
    monitorLoadTime() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                    const loadTime = entry.loadEventEnd - entry.startTime;
                    this.updateMetric('loadTime', loadTime);

                    if (loadTime > this.options.warningThresholds.loadTime) {
                        this.emitWarning('loadTime', loadTime);
                    }
                }
            }
        });

        observer.observe({ entryTypes: ['navigation'] });
    }

    // 更新指标
    updateMetric(name, value) {
        let samples = this.metrics.get(name) || [];
        samples.push({
            timestamp: Date.now(),
            value
        });

        // 限制样本数量
        if (samples.length > this.options.maxSamples) {
            samples = samples.slice(-this.options.maxSamples);
        }

        this.metrics.set(name, samples);
        this.notifyListeners(name, value);
    }

    // 获取指标
    getMetric(name) {
        return this.metrics.get(name) || [];
    }

    // 获取所有指标
    getAllMetrics() {
        const result = {};
        for (const [name, samples] of this.metrics) {
            result[name] = samples;
        }
        return result;
    }

    // 添加监听器
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // 添加警告处理器
    addWarningHandler(handler) {
        this.warningHandlers.add(handler);
        return () => this.warningHandlers.delete(handler);
    }

    // 通知监听器
    notifyListeners(name, value) {
        const data = {
            name,
            value,
            timestamp: Date.now()
        };

        this.listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error('Performance listener failed:', error);
            }
        });
    }

    // 发出警告
    emitWarning(type, value) {
        const warning = {
            type,
            value,
            threshold: this.options.warningThresholds[type],
            timestamp: Date.now()
        };

        this.warningHandlers.forEach(handler => {
            try {
                handler(warning);
            } catch (error) {
                console.error('Warning handler failed:', error);
            }
        });
    }

    // 生成性能报告
    generateReport() {
        const metrics = this.getAllMetrics();
        const report = {
            timestamp: Date.now(),
            metrics: {},
            warnings: [],
            recommendations: []
        };

        // 处理每个指标
        for (const [name, samples] of Object.entries(metrics)) {
            const values = samples.map(s => s.value);
            report.metrics[name] = {
                current: values[values.length - 1],
                average: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values)
            };

            // 生成警告和建议
            this.analyzeMetric(name, report.metrics[name], report);
        }

        return report;
    }

    // 分析指标并生成建议
    analyzeMetric(name, stats, report) {
        const threshold = this.options.warningThresholds[name];

        if (stats.current < threshold) {
            report.warnings.push({
                type: name,
                message: `${name} is below threshold (${stats.current} < ${threshold})`
            });

            // 根据不同指标生成具体建议
            switch (name) {
                case 'fps':
                    report.recommendations.push(
                        'Consider reducing visual effects or animations',
                        'Optimize render performance',
                        'Use hardware acceleration when possible'
                    );
                    break;
                case 'memory':
                    report.recommendations.push(
                        'Check for memory leaks',
                        'Implement proper cleanup in components',
                        'Consider using virtual lists for large datasets'
                    );
                    break;
                case 'cpu':
                    report.recommendations.push(
                        'Optimize expensive computations',
                        'Consider using Web Workers for heavy tasks',
                        'Implement proper debouncing and throttling'
                    );
                    break;
                case 'storage':
                    report.recommendations.push(
                        'Implement data cleanup strategies',
                        'Use compression for large data',
                        'Consider using quota management'
                    );
                    break;
            }
        }
    }

    // 清理定时器
    clearTimers() {
        // 清理由start方法创建的所有定时器
        this.metrics.clear();
        this.listeners.clear();
        this.warningHandlers.clear();
    }
}

export default new PerformanceManager();
