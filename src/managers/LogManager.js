class LogManager {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.listeners = new Set();
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        this.currentLevel = this.levels.INFO;
    }

    // 设置日志级别
    setLevel(level) {
        if (!(level in this.levels)) {
            throw new Error(`Invalid log level: ${level}`);
        }
        this.currentLevel = this.levels[level];
    }

    // 添加日志
    log(level, message, data = {}) {
        if (this.levels[level] < this.currentLevel) return;

        const logEntry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };

        this.logs.push(logEntry);
        this.trimLogs();
        this.notifyListeners(logEntry);

        // 错误日志特殊处理
        if (level === 'ERROR') {
            console.error(message, data);
            this.handleError(logEntry);
        }
    }

    // 调试日志
    debug(message, data) {
        this.log('DEBUG', message, data);
    }

    // 信息日志
    info(message, data) {
        this.log('INFO', message, data);
    }

    // 警告日志
    warn(message, data) {
        this.log('WARN', message, data);
    }

    // 错误日志
    error(message, data) {
        this.log('ERROR', message, data);
    }

    // 查询日志
    query(options = {}) {
        let results = [...this.logs];

        // 按级别过滤
        if (options.level) {
            results = results.filter(log => log.level === options.level);
        }

        // 按时间范围过滤
        if (options.startTime) {
            results = results.filter(log => log.timestamp >= options.startTime);
        }
        if (options.endTime) {
            results = results.filter(log => log.timestamp <= options.endTime);
        }

        // 按消息内容搜索
        if (options.search) {
            const searchRegex = new RegExp(options.search, 'i');
            results = results.filter(log =>
                searchRegex.test(log.message) ||
                searchRegex.test(JSON.stringify(log.data))
            );
        }

        // 排序
        if (options.sort) {
            const { field = 'timestamp', order = 'desc' } = options.sort;
            results.sort((a, b) => {
                const comparison = a[field] < b[field] ? -1 : 1;
                return order === 'desc' ? -comparison : comparison;
            });
        }

        // 分页
        if (options.limit) {
            const start = options.offset || 0;
            results = results.slice(start, start + options.limit);
        }

        return results;
    }

    // 清理日志
    clear() {
        this.logs = [];
        this.notifyListeners({ type: 'clear' });
    }

    // 导出日志
    export(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.logs, null, 2);
            case 'csv':
                return this.toCSV();
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    // 添加监听器
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // 内部方法：通知监听器
    notifyListeners(log) {
        for (const listener of this.listeners) {
            try {
                listener(log);
            } catch (error) {
                console.error('Error in log listener:', error);
            }
        }
    }

    // 内部方法：处理错误日志
    handleError(logEntry) {
        // 可以添加错误上报等逻辑
    }

    // 内部方法：限制日志数量
    trimLogs() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    // 内部方法：转换为CSV
    toCSV() {
        const headers = ['timestamp', 'level', 'message', 'data'];
        const rows = [headers];

        for (const log of this.logs) {
            rows.push([
                new Date(log.timestamp).toISOString(),
                log.level,
                log.message,
                JSON.stringify(log.data)
            ]);
        }

        return rows.map(row => row.join(',')).join('\n');
    }
}

export default new LogManager();
