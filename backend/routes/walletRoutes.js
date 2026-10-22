// Wallet routes for wallet APIs.
const express = require('express');
const WalletController = require('../controllers/walletController');

const router = express.Router();

router.get('/:userId', WalletController.getWallet);
router.post('/add', WalletController.addMoney);

module.exports = router;
