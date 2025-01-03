import { EventEmitter } from 'events';
import logManager from './LogManager';

class PerformanceMonitor extends EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        this.thresholds = new Map();
        this.observers = new Set();
        this.isMonitoring = false;
        this.setupDefaultThresholds();
    }

    // 开始监控
    start() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;

        // 启动各项监控
        this.startMemoryMonitoring();
        this.startCPUMonitoring();
        this.startFPSMonitoring();
        this.startNetworkMonitoring();
        this.startStorageMonitoring();

        this.emit('monitoring:start');
    }

    // 停止监控
    stop() {
        if (!this.isMonitoring) return;
        this.isMonitoring = false;

        // 清理定时器和观察者
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.metrics.clear();

        this.emit('monitoring:stop');
    }

    // 设置阈值
    setThreshold(metric, value) {
        this.thresholds.set(metric, value);
    }

    // 获取指标
    getMetric(name) {
        return this.metrics.get(name);
    }

    // 获取所有指标
    getAllMetrics() {
        return Object.fromEntries(this.metrics);
    }

    // 添加监听器
    addListener(callback) {
        super.addListener('metric:update', callback);
        return () => this.removeListener('metric:update', callback);
    }

    // 生成性能报告
    generateReport() {
        const metrics = this.getAllMetrics();
        const warnings = this.checkThresholds();
        const recommendations = this.generateRecommendations(warnings);

        return {
            timestamp: Date.now(),
            metrics,
            warnings,
            recommendations
        };
    }

    // 内部方法：设置默认阈值
    setupDefaultThresholds() {
        this.thresholds.set('memory.usage', 0.8); // 80%
        this.thresholds.set('cpu.usage', 0.7); // 70%
        this.thresholds.set('fps', 30);
        this.thresholds.set('loadTime', 3000); // 3s
        this.thresholds.set('storage.usage', 0.9); // 90%
    }

    // 内部方法：更新指标
    updateMetric(name, value, metadata = {}) {
        this.metrics.set(name, {
            value,
            timestamp: Date.now(),
            metadata
        });

        this.emit('metric:update', {
            name,
            value,
            metadata
        });

        // 检查阈值
        this.checkThreshold(name, value);
    }

    // 内部方法：检查阈值
    checkThreshold(name, value) {
        const threshold = this.thresholds.get(name);
        if (threshold && value > threshold) {
            this.emit('threshold:exceeded', {
                metric: name,
                value,
                threshold
            });
        }
    }

    // 内部方法：检查所有阈值
    checkThresholds() {
        const warnings = [];
        for (const [name, metric] of this.metrics) {
            const threshold = this.thresholds.get(name);
            if (threshold && metric.value > threshold) {
                warnings.push({
                    metric: name,
                    value: metric.value,
                    threshold
                });
            }
        }
        return warnings;
    }

    // 内部方法：生成优化建议
    generateRecommendations(warnings) {
        const recommendations = new Set();

        for (const warning of warnings) {
            switch (warning.metric) {
                case 'memory.usage':
                    recommendations.add('Consider implementing memory cleanup');
                    recommendations.add('Check for memory leaks');
                    break;
                case 'cpu.usage':
                    recommendations.add('Optimize expensive computations');
                    recommendations.add('Consider using Web Workers');
                    break;
                case 'fps':
                    recommendations.add('Reduce DOM operations');
                    recommendations.add('Optimize animations');
                    break;
                case 'loadTime':
                    recommendations.add('Implement lazy loading');
                    recommendations.add('Optimize resource loading');
                    break;
                case 'storage.usage':
                    recommendations.add('Implement data cleanup');
                    recommendations.add('Use compression for large data');
                    break;
            }
        }

        return Array.from(recommendations);
    }

    // 内部方法：内存监控
    startMemoryMonitoring() {
        if (!performance.memory) return;

        const checkMemory = () => {
            const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
            this.updateMetric('memory.usage', usedJSHeapSize / totalJSHeapSize, {
                used: usedJSHeapSize,
                total: totalJSHeapSize
            });
        };

        setInterval(checkMemory, 5000);
    }

    // 内部方法：CPU监控
    startCPUMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;

        const checkCPU = () => {
            const now = performance.now();
            const delta = now - lastTime;
            frameCount++;

            if (delta >= 1000) {
                const fps = frameCount * 1000 / delta;
                const cpuUsage = 1 - (fps / 60); // 估算CPU使用率

                this.updateMetric('cpu.usage', cpuUsage, {
                    fps,
                    frameCount
                });

                frameCount = 0;
                lastTime = now;
            }

            requestAnimationFrame(checkCPU);
        };

        requestAnimationFrame(checkCPU);
    }

    // 内部方法：FPS监控
    startFPSMonitoring() {
        let frames = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            frames++;
            const now = performance.now();

            if (now - lastTime >= 1000) {
                const fps = Math.round(frames * 1000 / (now - lastTime));
                this.updateMetric('fps', fps);
                frames = 0;
                lastTime = now;
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    // 内部方法：网络监控
    startNetworkMonitoring() {
        const observer = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'resource') {
                    this.updateMetric(`network.${entry.name}`, entry.duration, {
                        type: entry.initiatorType,
                        size: entry.transferSize,
                        protocol: entry.nextHopProtocol
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['resource'] });
        this.observers.add(observer);
    }

    // 内部方法：存储监控
    startStorageMonitoring() {
        const checkStorage = async () => {
            try {
                const quota = await navigator.storage.estimate();
                const usage = quota.usage / quota.quota;

                this.updateMetric('storage.usage', usage, {
                    used: quota.usage,
                    total: quota.quota,
                    details: quota.usageDetails
                });
            } catch (error) {
                logManager.error('Storage monitoring failed:', error);
            }
        };

        setInterval(checkStorage, 30000);
        checkStorage();
    }
}

export default new PerformanceMonitor();
