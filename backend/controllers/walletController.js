// Wallet controller handles wallet-related API requests.
const WalletModel = require('../models/walletModel');
const UserModel = require('../models/userModel');

// GET /api/wallet/:userId
const getWallet = (request, response) => {
  WalletModel.getWallet(request.params.userId, (error, wallet) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(wallet);
  });
};

// POST /api/wallet/add
// Add money to wallet with password verification.
const addMoney = (request, response) => {
  const { userId, amount, password } = request.body;

  if (!userId || !amount || !password) {
    return response.status(400).json({ message: 'User ID, amount, and password are required' });
  }

  if (amount <= 0) {
    return response.status(400).json({ message: 'Amount must be greater than 0' });
  }

  // Verify user password
  UserModel.getUserById(userId, (userError, user) => {
    if (userError) return response.status(500).json({ message: userError.message });
    if (!user) return response.status(404).json({ message: 'User not found' });
    
    if (user.password !== password) {
      return response.status(401).json({ message: 'Invalid password' });
    }

    // Add money to wallet
    WalletModel.addBalance(userId, amount, (error) => {
      if (error) return response.status(500).json({ message: error.message });
      
      WalletModel.getWallet(userId, (getError, wallet) => {
        if (getError) return response.status(500).json({ message: getError.message });
        return response.json({ 
          message: `₹${amount} added to wallet successfully`,
          wallet 
        });
      });
    });
  });
};

module.exports = {
  getWallet,
  addMoney
};
