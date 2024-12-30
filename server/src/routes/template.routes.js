const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/template.controller');
const auth = require('../middleware/auth.middleware');

// 公开路由
router.get('/market', TemplateController.getMarketTemplates);
router.get('/search', TemplateController.searchTemplates);

// 需要认证的路由
router.post('/', auth, TemplateController.createTemplate);
router.post('/:templateId/rate', auth, TemplateController.rateTemplate);
router.put('/:templateId/share', auth, TemplateController.toggleShare);

module.exports = router;
