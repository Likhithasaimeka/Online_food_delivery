// Create order routes for CRUD APIs.
const express = require('express');
const OrderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrder);
router.post('/', OrderController.createOrder);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

module.exports = router;
