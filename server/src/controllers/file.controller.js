const StorageService = require('../services/storage.service');

class FileController {
    // 下载文件
    async downloadFile(req, res) {
        try {
            const { fileName, type = 'template' } = req.params;

            // 验证文件类型
            if (!config.storage.local.allowedTypes.includes(req.headers['accept'])) {
                return res.status(400).json({
                    success: false,
                    message: '不支持的文件类型'
                });
            }

            const file = await StorageService.getFile(fileName, type);

            // 设置响应头
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

            res.send(file);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '下载文件失败',
                error: error.message
            });
        }
    }

    // 预览文件
    async previewFile(req, res) {
        try {
            const { fileName, type = 'template' } = req.params;
            const file = await StorageService.getFile(fileName, type);

            // 设置响应头
            res.setHeader('Content-Type', req.headers['accept'] || 'image/jpeg');
            res.send(file);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '预览文件失败',
                error: error.message
            });
        }
    }
}

module.exports = new FileController();
