const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');

// 公开路由
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// 需要认证的路由
router.get('/profile', auth, UserController.getProfile);
router.put('/settings', auth, UserController.updateSettings);

module.exports = router;
