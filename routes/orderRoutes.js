const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

// POST /api/orders - Create order (after payment)
router.post('/', orderController.createOrder);

// GET /api/orders/:orderId - Get order by ID
router.get('/:orderId', orderController.getOrder);

// Protected routes (admin only)
router.use(authController.protect);

// GET /api/orders - Get all orders
router.get('/', orderController.getAllOrders);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
