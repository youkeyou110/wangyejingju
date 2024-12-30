const express = require('express');
const router = express.Router();
const FileController = require('../controllers/file.controller');
const auth = require('../middleware/auth.middleware');

// 文件下载路由
router.get('/download/:type/:fileName', auth, FileController.downloadFile);
router.get('/preview/:type/:fileName', FileController.previewFile);

module.exports = router;
