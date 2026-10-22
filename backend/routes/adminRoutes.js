// Admin-only routes with JWT protection.
const express = require('express');
const AdminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public admin login route.
router.post('/login', AdminController.adminLogin);

// Protected admin routes.
router.get('/profile', adminAuth, AdminController.getAdminProfile);
router.put('/profile', adminAuth, AdminController.updateAdminProfile);
router.get('/stats', adminAuth, AdminController.getAdminStats);
router.get('/users', adminAuth, AdminController.getUsers);
router.put('/users/:id', adminAuth, AdminController.updateUserCredentials);
router.delete('/users/:id', adminAuth, AdminController.deleteUser);

router.get('/foods', adminAuth, AdminController.getFoods);
router.post('/foods', adminAuth, AdminController.createFood);
router.put('/foods/:id', adminAuth, AdminController.updateFood);
router.delete('/foods/:id', adminAuth, AdminController.deleteFood);

router.get('/orders', adminAuth, AdminController.getOrders);
router.put('/orders/:id', adminAuth, AdminController.updateOrderStatus);
router.put('/orders/:id/delivery-status', adminAuth, AdminController.updateDeliveryStatus);

module.exports = router;
