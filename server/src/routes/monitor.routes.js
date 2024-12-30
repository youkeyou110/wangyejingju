const express = require('express');
const router = express.Router();
const MonitorController = require('../controllers/monitor.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// 需要管理员权限的路由
router.use(auth, admin);

// 系统监控
router.get('/overview', MonitorController.getSystemOverview);
router.get('/metrics', MonitorController.getPerformanceMetrics);

// 告警管理
router.get('/alerts', MonitorController.getAlerts);
router.put('/alerts/:alertId/status', MonitorController.updateAlertStatus);

// 日志查看
router.get('/logs', MonitorController.getSystemLogs);

module.exports = router;
