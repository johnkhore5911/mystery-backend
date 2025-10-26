const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup - Admin signup
router.post('/signup', authController.signup);

// POST /api/auth/login - Admin login
router.post('/login', authController.login);

// GET /api/auth/me - Get current admin (protected)
router.get('/me', authController.protect, authController.getMe);

module.exports = router;
