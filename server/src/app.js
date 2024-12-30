const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const path = require('path');
const MonitorService = require('./services/monitor.service');

// 路由
const userRoutes = require('./routes/user.routes');
const templateRoutes = require('./routes/template.routes');
const fileRoutes = require('./routes/file.routes');
const monitorRoutes = require('./routes/monitor.routes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(MonitorService.setupRequestMonitoring());

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/monitor', monitorRoutes);

// 数据库连接
mongoose.connect(config.mongoUri)
    .then(() => console.log('数据库连接成功'))
    .catch(err => console.error('数据库连接失败:', err));

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: err.message
    });
});

// 启动服务器
app.listen(config.port, () => {
    console.log(`服务器运行在 http://localhost:${config.port}`);
});

module.exports = app;
