import { EventEmitter } from 'events';
import logManager from './LogManager';

class MonitorManager extends EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        this.alerts = new Map();
        this.config = {
            system: {
                cpu: {
                    threshold: 80, // CPU使用率阈值
                    interval: 5000 // 检查间隔
                },
                memory: {
                    threshold: 80, // 内存使用率阈值
                    interval: 5000
                },
                storage: {
                    threshold: 90, // 存储使用率阈值
                    interval: 60000
                }
            },
            business: {
                error: {
                    threshold: 5, // 错误数阈值
                    interval: 60000
                },
                response: {
                    threshold: 2000, // 响应时间阈值(ms)
                    interval: 5000
                },
                concurrent: {
                    threshold: 100, // 并发用户阈值
                    interval: 5000
                }
            },
            alert: {
                levels: ['info', 'warning', 'error', 'critical'],
                channels: ['console', 'notification', 'email'],
                retryInterval: 300000, // 重试间隔
                maxRetries: 3
            }
        };
        this.initialize();
    }

    // 初始化监控系统
    initialize() {
        this.startSystemMonitor();
        this.startBusinessMonitor();
        this.setupAlertSystem();
    }

    // 启动系统监控
    startSystemMonitor() {
        // 监控CPU
        setInterval(() => {
            this.monitorCPU();
        }, this.config.system.cpu.interval);

        // 监控内存
        setInterval(() => {
            this.monitorMemory();
        }, this.config.system.memory.interval);

        // 监控存储
        setInterval(() => {
            this.monitorStorage();
        }, this.config.system.storage.interval);
    }

    // 启动业务监控
    startBusinessMonitor() {
        // 监控错误率
        setInterval(() => {
            this.monitorErrors();
        }, this.config.business.error.interval);

        // 监控响应时间
        setInterval(() => {
            this.monitorResponse();
        }, this.config.business.response.interval);

        // 监控并发用户
        setInterval(() => {
            this.monitorConcurrent();
        }, this.config.business.concurrent.interval);
    }

    // 设置告警系统
    setupAlertSystem() {
        this.on('alert', this.handleAlert.bind(this));
        this.on('metric', this.checkThresholds.bind(this));
    }

    // 监控CPU
    async monitorCPU() {
        try {
            const usage = await this.getCPUUsage();
            this.updateMetric('cpu', usage);

            if (usage > this.config.system.cpu.threshold) {
                this.createAlert('cpu', {
                    level: 'warning',
                    message: `CPU usage is high: ${usage}%`
                });
            }
        } catch (error) {
            logManager.error('CPU monitoring failed:', error);
        }
    }

    // 监控内存
    async monitorMemory() {
        try {
            const usage = await this.getMemoryUsage();
            this.updateMetric('memory', usage);

            if (usage > this.config.system.memory.threshold) {
                this.createAlert('memory', {
                    level: 'warning',
                    message: `Memory usage is high: ${usage}%`
                });
            }
        } catch (error) {
            logManager.error('Memory monitoring failed:', error);
        }
    }

    // 监控存储
    async monitorStorage() {
        try {
            const usage = await this.getStorageUsage();
            this.updateMetric('storage', usage);

            if (usage > this.config.system.storage.threshold) {
                this.createAlert('storage', {
                    level: 'warning',
                    message: `Storage usage is high: ${usage}%`
                });
            }
        } catch (error) {
            logManager.error('Storage monitoring failed:', error);
        }
    }

    // 监控错误率
    async monitorErrors() {
        try {
            const errorCount = await this.getErrorCount();
            this.updateMetric('errors', errorCount);

            if (errorCount > this.config.business.error.threshold) {
                this.createAlert('errors', {
                    level: 'error',
                    message: `High error rate detected: ${errorCount} errors`
                });
            }
        } catch (error) {
            logManager.error('Error monitoring failed:', error);
        }
    }

    // 监控响应时间
    async monitorResponse() {
        try {
            const responseTime = await this.getResponseTime();
            this.updateMetric('response', responseTime);

            if (responseTime > this.config.business.response.threshold) {
                this.createAlert('response', {
                    level: 'warning',
                    message: `Slow response time: ${responseTime}ms`
                });
            }
        } catch (error) {
            logManager.error('Response monitoring failed:', error);
        }
    }

    // 监控并发用户
    async monitorConcurrent() {
        try {
            const userCount = await this.getConcurrentUsers();
            this.updateMetric('concurrent', userCount);

            if (userCount > this.config.business.concurrent.threshold) {
                this.createAlert('concurrent', {
                    level: 'warning',
                    message: `High concurrent users: ${userCount}`
                });
            }
        } catch (error) {
            logManager.error('Concurrent monitoring failed:', error);
        }
    }

    // 更新指标
    updateMetric(name, value) {
        const metric = {
            value,
            timestamp: Date.now()
        };
        this.metrics.set(name, metric);
        this.emit('metric', { name, ...metric });
    }

    // 创建告警
    createAlert(type, data) {
        const alert = {
            id: `${type}-${Date.now()}`,
            type,
            ...data,
            timestamp: Date.now(),
            status: 'new'
        };
        this.alerts.set(alert.id, alert);
        this.emit('alert', alert);
    }

    // 处理告警
    async handleAlert(alert) {
        try {
            // 根据告警级别选择通知渠道
            const channels = this.selectAlertChannels(alert);

            // 发送告警通知
            for (const channel of channels) {
                await this.sendAlert(channel, alert);
            }

            // 更新告警状态
            this.updateAlertStatus(alert.id, 'sent');
        } catch (error) {
            logManager.error('Alert handling failed:', error);
            this.retryAlert(alert);
        }
    }

    // 选择告警渠道
    selectAlertChannels(alert) {
        switch (alert.level) {
            case 'critical':
                return ['console', 'notification', 'email'];
            case 'error':
                return ['console', 'notification'];
            case 'warning':
                return ['console'];
            default:
                return ['console'];
        }
    }

    // 发送告警
    async sendAlert(channel, alert) {
        switch (channel) {
            case 'console':
                console.warn(`[${alert.level}] ${alert.message}`);
                break;
            case 'notification':
                await this.sendNotification(alert);
                break;
            case 'email':
                await this.sendEmail(alert);
                break;
        }
    }

    // 重试告警
    retryAlert(alert) {
        const retryCount = (alert.retries || 0) + 1;
        if (retryCount <= this.config.alert.maxRetries) {
            setTimeout(() => {
                this.handleAlert({
                    ...alert,
                    retries: retryCount
                });
            }, this.config.alert.retryInterval);
        }
    }

    // 获取监控数据
    getMetrics() {
        return Array.from(this.metrics.entries()).map(([name, data]) => ({
            name,
            ...data
        }));
    }

    // 获取告警列表
    getAlerts() {
        return Array.from(this.alerts.values());
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}

export default new MonitorManager();
