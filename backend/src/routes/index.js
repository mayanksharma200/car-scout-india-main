const express = require('express');
const router = express.Router();

// Import all route modules
const healthRoutes = require('./healthRoutes');
const carRoutes = require('./carRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const leadRoutes = require('./leadRoutes');
const adminRoutes = require('./adminRoutes');

// Mount routes
router.use('/health', healthRoutes);
router.use('/cars', carRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/leads', leadRoutes);
router.use('/admin', adminRoutes);

module.exports = router;