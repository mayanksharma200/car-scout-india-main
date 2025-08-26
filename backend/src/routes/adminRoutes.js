const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateToken, requireAdmin } = require('../middleware/auth');

// Admin routes (require authentication and admin role)
router.get('/stats', validateToken, requireAdmin, adminController.getStats);

module.exports = router;