// Payment routes for payment APIs.
const express = require('express');
const PaymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/', PaymentController.getAllPayments);
router.get('/user/:userId', PaymentController.getUserPayments);
router.get('/income/:filter', PaymentController.getIncome);
router.post('/process', PaymentController.processPayment);

module.exports = router;
