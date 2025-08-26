const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { optionalAuth } = require('../middleware/auth');

// Car routes
router.get('/featured', carController.getFeaturedCars);
router.get('/search', carController.searchCars);
router.get('/search-advanced', carController.searchAdvancedCars);
router.get('/search-weighted', carController.searchWeightedCars);
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);

module.exports = router;