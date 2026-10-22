// Payment controller handles payment-related API requests.
const PaymentModel = require('../models/paymentModel');
const WalletModel = require('../models/walletModel');
const UserModel = require('../models/userModel');
const OrderModel = require('../models/orderModel');

// GET /api/payments
const getAllPayments = (request, response) => {
  PaymentModel.getAllPayments((error, payments) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(payments);
  });
};

// GET /api/payments/user/:userId
const getUserPayments = (request, response) => {
  PaymentModel.getPaymentsByUserId(request.params.userId, (error, payments) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(payments);
  });
};

// GET /api/payments/income/:filter
const getIncome = (request, response) => {
  const filter = request.params.filter || 'all';
  PaymentModel.getIncomeStats(filter, (error, stats) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(stats);
  });
};

// POST /api/payments/process
// Process payment for an order using user's password verification.
const processPayment = (request, response) => {
  const { orderId, userId, amount, password } = request.body;

  if (!orderId || !userId || !amount || !password) {
    return response.status(400).json({ message: 'Order ID, user ID, amount, and password are required' });
  }

  // Verify user password
  UserModel.getUserById(userId, (userError, user) => {
    if (userError) return response.status(500).json({ message: userError.message });
    if (!user) return response.status(404).json({ message: 'User not found' });
    
    // Check if password matches (in real app, use bcrypt)
    if (user.password !== password) {
      return response.status(401).json({ message: 'Invalid payment password' });
    }

    // Check wallet balance
    WalletModel.getWallet(userId, (walletError, wallet) => {
      if (walletError) return response.status(500).json({ message: walletError.message });
      
      if (!wallet || wallet.balance < amount) {
        return response.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct from wallet
      WalletModel.deductBalance(userId, amount, (deductError) => {
        if (deductError) return response.status(500).json({ message: deductError.message });

        // Create payment record
        const transactionId = `TXN${Date.now()}${userId}`;
        PaymentModel.createPayment(
          {
            orderId,
            userId,
            amount,
            paymentMethod: 'Wallet',
            status: 'Completed',
            transactionId
          },
          (paymentError, payment) => {
            if (paymentError) return response.status(500).json({ message: paymentError.message });
            
            // Mark order(s) as Paid
            const targetOrderIds = Array.isArray(request.body.orderIds) && request.body.orderIds.length > 0
              ? request.body.orderIds
              : [orderId];

            let pendingCount = targetOrderIds.length;
            targetOrderIds.forEach((targetId) => {
              OrderModel.updatePaymentStatus(targetId, 'Paid', () => {
                pendingCount -= 1;
                if (pendingCount === 0) {
                  return response.json({ 
                    message: 'Payment successful',
                    payment,
                    transactionId 
                  });
                }
              });
            });
          }
        );
      });
    });
  });
};

module.exports = {
  getAllPayments,
  getUserPayments,
  getIncome,
  processPayment
};
