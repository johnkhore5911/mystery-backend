const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authController = require('../controllers/authController');

// Public routes
router.get('/categories', menuController.getAllCategories);
router.get('/items', menuController.getAllMenuItems);
router.get('/items/:id', menuController.getMenuItem);

// Protected routes (admin only)
router.use(authController.protect);

// Categories
router.post('/categories', menuController.createCategory);
router.put('/categories/:id', menuController.updateCategory);
router.delete('/categories/:id', menuController.deleteCategory);

// Menu Items
router.post('/items', menuController.createMenuItem);
router.put('/items/:id', menuController.updateMenuItem);
router.delete('/items/:id', menuController.deleteMenuItem);

module.exports = router;
