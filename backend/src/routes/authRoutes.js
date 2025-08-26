const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateToken } = require('../middleware/auth');

// Authentication routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh', authController.refreshToken);
router.post('/logout', validateToken, authController.logout);
router.post('/supabase-logout', authController.supabaseLogout);
router.post('/google-oauth', authController.googleOAuth);
router.get('/verify', validateToken, authController.verifyToken);

// Development/admin routes
router.post('/create-test-user', authController.createTestUser);
router.post('/create-admin', authController.createAdmin);

module.exports = router;