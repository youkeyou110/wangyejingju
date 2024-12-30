const os = require('os');
const mongoose = require('mongoose');
const winston = require('winston');
const config = require('../config/monitor.config');
const { createLogger, format, transports } = winston;
const AppError = require('../utils/AppError');

class MonitorService {
    constructor() {
        this.setupLogger();
        this.setupMetrics();
        this.setupAlerts();
        this.startMonitoring();
    }

    // 设置日志系统
    setupLogger() {
        this.logger = createLogger({
            level: config.logging.level,
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
            transports: [
                // 错误日志
                new transports.File({
                    filename: `${config.logging.dir}/error.log`,
                    level: 'error',
                    maxsize: config.logging.maxSize,
                    maxFiles: config.logging.maxFiles
                }),
                // 所有日志
                new transports.File({
                    filename: `${config.logging.dir}/combined.log`,
                    maxsize: config.logging.maxSize,
                    maxFiles: config.logging.maxFiles
                })
            ]
        });

        // 开发环境下同时输出到控制台
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new transports.Console({
                format: format.simple()
            }));
        }
    }

    // 设置性能指标收集
    setupMetrics() {
        this.metrics = mongoose.model('Metric', {
            timestamp: { type: Date, default: Date.now },
            type: String,
            value: Number,
            metadata: Object
        });
    }

    // 设置告警系统
    setupAlerts() {
        this.alerts = mongoose.model('Alert', {
            timestamp: { type: Date, default: Date.now },
            level: String,
            message: String,
            metadata: Object,
            status: {
                type: String,
                enum: ['new', 'acknowledged', 'resolved'],
                default: 'new'
            }
        });
    }

    // 开始监控
    startMonitoring() {
        // 系统资源监控
        setInterval(() => this.monitorSystem(), 5000);
        // 数据库监控
        setInterval(() => this.monitorDatabase(), 10000);
        // API性能监控
        this.setupRequestMonitoring();
    }

    // 监控系统资源
    async monitorSystem() {
        const metrics = {
            cpu: os.loadavg()[0],
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            },
            uptime: os.uptime()
        };

        await this.saveMetrics('system', metrics);

        // 检查告警条件
        if (metrics.cpu > config.performance.cpuThreshold) {
            await this.createAlert('warning', 'High CPU usage', metrics);
        }

        const memoryUsage = (metrics.memory.used / metrics.memory.total) * 100;
        if (memoryUsage > config.performance.memoryThreshold) {
            await this.createAlert('warning', 'High memory usage', metrics);
        }
    }

    // 监控数据库
    async monitorDatabase() {
        const stats = await mongoose.connection.db.stats();
        await this.saveMetrics('database', {
            collections: stats.collections,
            objects: stats.objects,
            avgObjSize: stats.avgObjSize,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize
        });
    }

    // 设置请求监控中间件
    setupRequestMonitoring() {
        return async (req, res, next) => {
            const start = Date.now();
            const originalEnd = res.end;

            // 重写 res.end 以收集响应时间
            res.end = (...args) => {
                const duration = Date.now() - start;
                this.saveMetrics('request', {
                    duration,
                    path: req.path,
                    method: req.method,
                    statusCode: res.statusCode
                });

                // 检查慢请求
                if (duration > config.performance.slowRequestThreshold) {
                    this.createAlert('warning', 'Slow request detected', {
                        duration,
                        path: req.path,
                        method: req.method
                    });
                }

                originalEnd.apply(res, args);
            };

            next();
        };
    }

    // 保存指标数据
    async saveMetrics(type, value) {
        await this.metrics.create({
            type,
            value: typeof value === 'number' ? value : 0,
            metadata: typeof value === 'object' ? value : {}
        });
    }

    // 创建告警
    async createAlert(level, message, metadata = {}) {
        // 检查是否在告警间隔内
        const recentAlert = await this.alerts.findOne({
            level,
            message,
            status: { $ne: 'resolved' },
            timestamp: {
                $gte: new Date(Date.now() - config.alerts.interval * 60000)
            }
        });

        if (!recentAlert) {
            const alert = await this.alerts.create({
                level,
                message,
                metadata
            });

            // 发送告警通知
            await this.sendAlertNotification(alert);
        }
    }

    // 发送告警通知
    async sendAlertNotification(alert) {
        // 根据配置的通道发送通知
        for (const channel of config.alerts.channels) {
            switch (channel) {
                case 'email':
                    await this.sendEmailAlert(alert);
                    break;
                case 'webhook':
                    await this.sendWebhookAlert(alert);
                    break;
            }
        }
    }

    // 发送邮件告警
    async sendEmailAlert(alert) {
        // TODO: 实现邮件发送逻辑
        this.logger.info('Email alert sent', { alert });
    }

    // 发送Webhook告警
    async sendWebhookAlert(alert) {
        // TODO: 实现webhook通知逻辑
        this.logger.info('Webhook alert sent', { alert });
    }

    // 获取监控数据
    async getMetrics(type, timeRange) {
        return this.metrics
            .find({
                type,
                timestamp: {
                    $gte: new Date(Date.now() - timeRange * 60000)
                }
            })
            .sort({ timestamp: 1 });
    }

    // 获取告警列表
    async getAlerts(status, page = 1, limit = 10) {
        const query = status ? { status } : {};
        const alerts = await this.alerts
            .find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await this.alerts.countDocuments(query);

        return {
            alerts,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // 更新告警状态
    async updateAlertStatus(alertId, status) {
        const alert = await this.alerts.findByIdAndUpdate(
            alertId,
            { status },
            { new: true }
        );

        if (!alert) {
            throw new AppError('MONITOR.ALERT_NOT_FOUND');
        }

        return alert;
    }

    // 获取系统日志
    async getSystemLogs({ level, startTime, endTime, page = 1, limit = 50 }) {
        const query = {};

        if (level) {
            query.level = level;
        }

        if (startTime || endTime) {
            query.timestamp = {};
            if (startTime) {
                query.timestamp.$gte = new Date(startTime);
            }
            if (endTime) {
                query.timestamp.$lte = new Date(endTime);
            }
        }

        const logs = await this.logger.query({
            from: (page - 1) * limit,
            until: page * limit - 1,
            limit,
            order: 'desc',
            ...query
        });

        const total = await this.logger.query({
            ...query,
            count: true
        });

        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}

module.exports = new MonitorService();
