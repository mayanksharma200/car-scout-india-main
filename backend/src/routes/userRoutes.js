const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateToken } = require('../middleware/auth');

// User routes (all require authentication)
router.get('/profile', validateToken, userController.getProfile);
router.put('/profile', validateToken, userController.updateProfile);

module.exports = router;