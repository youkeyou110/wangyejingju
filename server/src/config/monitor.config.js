module.exports = {
    // 日志配置
    logging: {
        // 日志级别
        level: process.env.LOG_LEVEL || 'info',
        // 日志文件路径
        dir: 'logs',
        // 日志文件最大大小
        maxSize: '10m',
        // 保留日志文件数量
        maxFiles: 5,
        // 日志格式
        format: 'combined'
    },

    // 性能监控配置
    performance: {
        // 采样率
        sampleRate: 0.1,
        // 慢请求阈值（毫秒）
        slowRequestThreshold: 1000,
        // 内存使用警告阈值（MB）
        memoryThreshold: 1024,
        // CPU使用警告阈值（%）
        cpuThreshold: 80
    },

    // 告警配置
    alerts: {
        // 告警通道
        channels: ['email', 'webhook'],
        // 告警级别
        levels: ['error', 'warning', 'info'],
        // 告警间隔（分钟）
        interval: 5,
        // 告警接收者
        recipients: process.env.ALERT_RECIPIENTS?.split(',') || []
    },

    // 监控面板配置
    dashboard: {
        // 更新间隔（秒）
        updateInterval: 10,
        // 历史数据保留时间（天）
        retentionDays: 7,
        // 图表配置
        charts: {
            // 时间跨度选项（分钟）
            timeRanges: [5, 15, 30, 60, 180, 360]
        }
    }
};
