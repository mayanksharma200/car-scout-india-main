const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { optionalAuth } = require('../middleware/auth');

// Lead routes
router.post('/', optionalAuth, leadController.createLead);

module.exports = router;