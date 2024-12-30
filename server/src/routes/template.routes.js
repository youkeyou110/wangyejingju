const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/template.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// 公开路由
router.get('/market', TemplateController.getMarketTemplates);
router.get('/search', TemplateController.searchTemplates);

// 需要认证的路由
router.post('/', auth, upload.single('thumbnail'), TemplateController.createTemplate);
router.post('/:templateId/rate', auth, TemplateController.rateTemplate);
router.put('/:templateId/share', auth, TemplateController.toggleShare);

// 版本控制路由
router.get('/:templateId/versions', auth, TemplateController.getVersionHistory);
router.post('/:templateId/versions/:version/rollback', auth, TemplateController.rollbackVersion);
router.get('/:templateId/versions/compare', auth, TemplateController.compareVersions);

module.exports = router;
