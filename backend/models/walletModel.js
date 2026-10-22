// Wallet model handles user wallet operations.
const db = require('../config/db');

// Get or create wallet for user.
const getWallet = (userId, callback) => {
  db.get('SELECT * FROM user_wallet WHERE userId = ?', [userId], (error, wallet) => {
    if (error) return callback(error);
    if (wallet) return callback(null, wallet);
    
    // Create wallet if doesn't exist
    db.run(
      'INSERT INTO user_wallet (userId, balance) VALUES (?, 0)',
      [userId],
      function (err) {
        if (err) return callback(err);
        callback(null, { userId, balance: 0 });
      }
    );
  });
};

// Add money to wallet.
const addBalance = (userId, amount, callback) => {
  db.run(
    `INSERT INTO user_wallet (userId, balance, updatedAt) VALUES (?, ?, datetime('now'))
     ON CONFLICT(userId) DO UPDATE SET 
     balance = balance + ?,
     updatedAt = datetime('now')`,
    [userId, amount, amount],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Deduct money from wallet.
const deductBalance = (userId, amount, callback) => {
  // First check if user has sufficient balance
  getWallet(userId, (error, wallet) => {
    if (error) return callback(error);
    if (!wallet || wallet.balance < amount) {
      return callback(new Error('Insufficient wallet balance'));
    }

    db.run(
      `UPDATE user_wallet 
       SET balance = balance - ?, 
           updatedAt = datetime('now')
       WHERE userId = ?`,
      [amount, userId],
      function (err) {
        callback(err, this?.changes);
      }
    );
  });
};

// Update wallet balance.
const updateBalance = (userId, newBalance, callback) => {
  db.run(
    `INSERT INTO user_wallet (userId, balance, updatedAt) VALUES (?, ?, datetime('now'))
     ON CONFLICT(userId) DO UPDATE SET 
     balance = ?,
     updatedAt = datetime('now')`,
    [userId, newBalance, newBalance],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

module.exports = {
  getWallet,
  addBalance,
  deductBalance,
  updateBalance
};
