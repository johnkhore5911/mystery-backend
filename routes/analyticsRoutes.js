// const express = require('express');
// const router = express.Router();
// const analyticsController = require('../controllers/analyticsController');
// const authController = require('../controllers/authController');

// // All analytics routes are protected
// router.use(authController.protect);

// // GET /api/analytics/dashboard - Get dashboard stats
// router.get('/dashboard', analyticsController.getDashboardStats);

// // GET /api/analytics/revenue - Get revenue data
// router.get('/revenue', analyticsController.getRevenueData);

// // GET /api/analytics/popular-items - Get popular items
// router.get('/popular-items', analyticsController.getPopularItems);

// module.exports = router;


const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authController = require('../controllers/authController');

// All analytics routes are protected
router.use(authController.protect);

// GET /api/analytics/dashboard - Get dashboard stats
router.get('/dashboard', analyticsController.getDashboardStats);

// GET /api/analytics/revenue - Get revenue data
router.get('/revenue', analyticsController.getRevenueData);

// GET /api/analytics/popular-items - Get popular items
router.get('/popular-items', analyticsController.getPopularItems);

// GET /api/analytics/categories - Get category distribution
router.get('/categories', analyticsController.getCategoryData);

// GET /api/analytics/peak-hours - Get peak hours data
router.get('/peak-hours', analyticsController.getPeakHoursData);

module.exports = router;
