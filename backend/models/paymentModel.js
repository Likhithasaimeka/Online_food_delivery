// Payment model handles payment transactions.
const db = require('../config/db');

// Create a payment record.
const createPayment = (data, callback) => {
  const { orderId, userId, amount, paymentMethod, status, transactionId } = data;
  db.run(
    'INSERT INTO payments (orderId, userId, amount, paymentMethod, status, transactionId) VALUES (?, ?, ?, ?, ?, ?)',
    [orderId, userId, amount, paymentMethod || 'Wallet', status || 'Completed', transactionId || null],
    function (error) {
      callback(error, { id: this?.lastID, ...data });
    }
  );
};

// Get all payments.
const getAllPayments = (callback) => {
  db.all(
    `SELECT p.*, u.name as userName, u.email as userEmail 
     FROM payments p
     LEFT JOIN users u ON p.userId = u.id
     ORDER BY p.createdAt DESC`,
    [],
    callback
  );
};

// Get payments by user ID.
const getPaymentsByUserId = (userId, callback) => {
  db.all(
    'SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC',
    [userId],
    callback
  );
};

// Get payment by order ID.
const getPaymentByOrderId = (orderId, callback) => {
  db.get('SELECT * FROM payments WHERE orderId = ?', [orderId], callback);
};

// Get income statistics with date filters.
const getIncomeStats = (filter, callback) => {
  const conditions = ["status = 'Completed'"];
  const now = new Date();
  
  switch (filter) {
    case 'today': {
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      conditions.push(`createdAt >= '${todayStart}'`);
      break;
    }
    case 'week': {
      const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
      conditions.push(`createdAt >= '${weekStart}'`);
      break;
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      conditions.push(`createdAt >= '${monthStart}'`);
      break;
    }
    case 'year': {
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
      conditions.push(`createdAt >= '${yearStart}'`);
      break;
    }
    default:
      break;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  db.get(
    `SELECT 
      COUNT(*) as totalTransactions,
      COALESCE(SUM(amount), 0) as totalIncome,
      COALESCE(AVG(amount), 0) as averageOrderValue
     FROM payments
     ${whereClause}`,
    [],
    callback
  );
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByUserId,
  getPaymentByOrderId,
  getIncomeStats
};
