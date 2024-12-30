const MonitorService = require('../services/monitor.service');

class MonitorController {
    // 获取系统概览
    async getSystemOverview(req, res) {
        try {
            const timeRange = parseInt(req.query.timeRange) || 5;
            const [system, database, requests] = await Promise.all([
                MonitorService.getMetrics('system', timeRange),
                MonitorService.getMetrics('database', timeRange),
                MonitorService.getMetrics('request', timeRange)
            ]);

            res.json({
                success: true,
                data: {
                    system,
                    database,
                    requests
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取系统概览失败',
                error: error.message
            });
        }
    }

    // 获取性能指标
    async getPerformanceMetrics(req, res) {
        try {
            const { type, timeRange = 5 } = req.query;
            const metrics = await MonitorService.getMetrics(type, parseInt(timeRange));

            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取性能指标失败',
                error: error.message
            });
        }
    }

    // 获取告警列表
    async getAlerts(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;
            const alerts = await MonitorService.getAlerts(
                status,
                parseInt(page),
                parseInt(limit)
            );

            res.json({
                success: true,
                data: alerts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取告警列表失败',
                error: error.message
            });
        }
    }

    // 更新告警状态
    async updateAlertStatus(req, res) {
        try {
            const { alertId } = req.params;
            const { status } = req.body;

            const alert = await MonitorService.updateAlertStatus(alertId, status);

            res.json({
                success: true,
                message: '更新告警状态成功',
                data: alert
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '更新告警状态失败',
                error: error.message
            });
        }
    }

    // 获取系统日志
    async getSystemLogs(req, res) {
        try {
            const { level, startTime, endTime, page = 1, limit = 50 } = req.query;
            const logs = await MonitorService.getSystemLogs({
                level,
                startTime,
                endTime,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取系统日志失败',
                error: error.message
            });
        }
    }
}

module.exports = new MonitorController();
