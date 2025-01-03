import { EventEmitter } from 'events';
import logManager from './LogManager';
import metricsManager from './MetricsManager';

class PerformanceLogManager extends EventEmitter {
    constructor() {
        super();
        this.logs = new Map();
        this.analysisResults = new Map();
        this.config = {
            maxLogAge: 7 * 24 * 60 * 60 * 1000, // 7天
            maxLogsPerType: 10000,
            analysisPeriod: 24 * 60 * 60 * 1000, // 1天
            aggregationInterval: 60 * 60 * 1000,  // 1小时
        };
        this.setupListeners();
    }

    // 设置监听器
    setupListeners() {
        metricsManager.on('metricsUpdated', this.handleMetricsUpdate.bind(this));
        metricsManager.on('thresholdExceeded', this.handleThresholdExceeded.bind(this));
        metricsManager.on('budgetExceeded', this.handleBudgetExceeded.bind(this));
    }

    // 处理指标更新
    handleMetricsUpdate(metrics) {
        this.logMetrics(metrics);
        this.analyze();
    }

    // 处理阈值超出
    handleThresholdExceeded(data) {
        this.logEvent('threshold_exceeded', data);
    }

    // 处理预算超出
    handleBudgetExceeded(data) {
        this.logEvent('budget_exceeded', data);
    }

    // 记录指标
    logMetrics(metrics) {
        const timestamp = Date.now();
        Object.entries(metrics).forEach(([name, value]) => {
            this.addLogEntry('metric', {
                name,
                value,
                timestamp
            });
        });
    }

    // 记录事件
    logEvent(type, data) {
        this.addLogEntry('event', {
            type,
            ...data,
            timestamp: Date.now()
        });
    }

    // 添加日志条目
    addLogEntry(category, entry) {
        if (!this.logs.has(category)) {
            this.logs.set(category, []);
        }

        const logs = this.logs.get(category);
        logs.push(entry);

        // 清理过期日志
        this.cleanupLogs(category);
    }

    // 清理过期日志
    cleanupLogs(category) {
        const logs = this.logs.get(category);
        if (!logs) return;

        const now = Date.now();
        const maxAge = this.config.maxLogAge;
        const maxLogs = this.config.maxLogsPerType;

        // 移除过期日志
        const validLogs = logs.filter(log =>
            (now - log.timestamp) <= maxAge
        );

        // 如果仍然超过最大数量，保留最新的日志
        if (validLogs.length > maxLogs) {
            validLogs.splice(0, validLogs.length - maxLogs);
        }

        this.logs.set(category, validLogs);
    }

    // 分析日志
    analyze() {
        try {
            const metrics = this.analyzeMetrics();
            const events = this.analyzeEvents();
            const patterns = this.findPatterns();
            const trends = this.analyzeTrends();

            const results = {
                timestamp: Date.now(),
                metrics,
                events,
                patterns,
                trends,
                recommendations: this.generateRecommendations({
                    metrics,
                    events,
                    patterns,
                    trends
                })
            };

            this.analysisResults.set('latest', results);
            this.emit('analysisComplete', results);

        } catch (error) {
            logManager.error('Performance log analysis failed:', error);
        }
    }

    // 分析指标
    analyzeMetrics() {
        const metricLogs = this.logs.get('metric') || [];
        const analysis = {};

        // 按指标类型分组
        const groupedMetrics = new Map();
        metricLogs.forEach(log => {
            if (!groupedMetrics.has(log.name)) {
                groupedMetrics.set(log.name, []);
            }
            groupedMetrics.get(log.name).push(log);
        });

        // 分析每种指标
        for (const [name, logs] of groupedMetrics) {
            analysis[name] = {
                average: this.calculateAverage(logs.map(l => l.value)),
                median: this.calculateMedian(logs.map(l => l.value)),
                percentile95: this.calculatePercentile(logs.map(l => l.value), 95),
                trend: this.calculateTrend(logs),
                volatility: this.calculateVolatility(logs.map(l => l.value))
            };
        }

        return analysis;
    }

    // 分析事件
    analyzeEvents() {
        const eventLogs = this.logs.get('event') || [];
        const analysis = {
            total: eventLogs.length,
            byType: new Map(),
            frequency: {},
            patterns: []
        };

        // 按类型统计
        eventLogs.forEach(event => {
            if (!analysis.byType.has(event.type)) {
                analysis.byType.set(event.type, 0);
            }
            analysis.byType.set(event.type, analysis.byType.get(event.type) + 1);
        });

        // 分析频率
        const timeRanges = this.getTimeRanges(eventLogs);
        timeRanges.forEach(range => {
            const eventsInRange = eventLogs.filter(e =>
                e.timestamp >= range.start && e.timestamp < range.end
            );
            analysis.frequency[range.label] = eventsInRange.length;
        });

        return analysis;
    }

    // 查找模式
    findPatterns() {
        const patterns = [];
        const metricLogs = this.logs.get('metric') || [];
        const eventLogs = this.logs.get('event') || [];

        // 查找指标相关性
        const correlations = this.findCorrelations(metricLogs);
        patterns.push(...correlations);

        // 查找事件序列
        const sequences = this.findEventSequences(eventLogs);
        patterns.push(...sequences);

        // 查找周期性模式
        const cycles = this.findCyclicPatterns(metricLogs);
        patterns.push(...cycles);

        return patterns;
    }

    // 分析趋势
    analyzeTrends() {
        const trends = {};
        const metricLogs = this.logs.get('metric') || [];

        // 按指标分组
        const groupedMetrics = new Map();
        metricLogs.forEach(log => {
            if (!groupedMetrics.has(log.name)) {
                groupedMetrics.set(log.name, []);
            }
            groupedMetrics.get(log.name).push(log);
        });

        // 分析每个指标的趋势
        for (const [name, logs] of groupedMetrics) {
            trends[name] = {
                shortTerm: this.analyzeTrendPeriod(logs, '1h'),
                mediumTerm: this.analyzeTrendPeriod(logs, '1d'),
                longTerm: this.analyzeTrendPeriod(logs, '7d')
            };
        }

        return trends;
    }

    // 生成建议
    generateRecommendations(analysis) {
        const recommendations = [];

        // 基于指标分析的建议
        Object.entries(analysis.metrics).forEach(([name, data]) => {
            if (data.trend === 'increasing' && data.volatility > 0.2) {
                recommendations.push({
                    type: 'metric',
                    metric: name,
                    severity: 'warning',
                    message: `${name}指标波动较大且呈上升趋势，建议关注。`
                });
            }
        });

        // 基于事件分析的建议
        if (analysis.events.total > 100) {
            recommendations.push({
                type: 'event',
                severity: 'warning',
                message: '事件频率较高，建议检查性能瓶颈。'
            });
        }

        // 基于模式分析的建议
        analysis.patterns.forEach(pattern => {
            if (pattern.confidence > 0.8) {
                recommendations.push({
                    type: 'pattern',
                    severity: 'info',
                    message: `发现性能模式：${pattern.description}`
                });
            }
        });

        return recommendations;
    }

    // 获取分析报告
    getAnalysisReport() {
        return this.analysisResults.get('latest') || null;
    }

    // 工具方法
    calculateAverage(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    calculatePercentile(values, p) {
        const sorted = [...values].sort((a, b) => a - b);
        const pos = (sorted.length - 1) * p / 100;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }

    calculateTrend(logs) {
        if (logs.length < 2) return 'stable';
        const values = logs.map(l => l.value);
        const first = values[0];
        const last = values[values.length - 1];
        const diff = last - first;
        if (Math.abs(diff) < first * 0.1) return 'stable';
        return diff > 0 ? 'increasing' : 'decreasing';
    }

    calculateVolatility(values) {
        const avg = this.calculateAverage(values);
        const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(this.calculateAverage(squaredDiffs)) / avg;
    }

    getTimeRanges(logs) {
        if (logs.length === 0) return [];
        const now = Date.now();
        const ranges = [
            { label: '1h', start: now - 60 * 60 * 1000 },
            { label: '6h', start: now - 6 * 60 * 60 * 1000 },
            { label: '24h', start: now - 24 * 60 * 60 * 1000 },
            { label: '7d', start: now - 7 * 24 * 60 * 60 * 1000 }
        ];
        ranges.forEach(r => r.end = now);
        return ranges;
    }
}

export default new PerformanceLogManager();
