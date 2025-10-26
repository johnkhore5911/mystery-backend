const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payment/create-order - Create Razorpay order
router.post('/create-order', paymentController.createRazorpayOrder);

// POST /api/payment/verify - Verify payment
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
