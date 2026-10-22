// Import shared database connection.
const db = require('../config/db');

// Return all orders with user and food details joined.
const getAllOrders = (callback) => {
  db.all(
    `SELECT o.*, u.name AS userName, f.name AS foodName, f.price AS foodPrice
     FROM orders o
     JOIN users u ON o.userId = u.id
     JOIN foods f ON o.foodId = f.id
     ORDER BY o.createdAt DESC`,
    [],
    callback
  );
};

// Return one order by id.
const getOrderById = (id, callback) => {
  db.get(
    `SELECT o.*, u.name AS userName, f.name AS foodName, f.price AS foodPrice
     FROM orders o
     JOIN users u ON o.userId = u.id
     JOIN foods f ON o.foodId = f.id
     WHERE o.id = ?`,
    [id],
    callback
  );
};

// Insert a new order with payment details.
const createOrder = (order, callback) => {
  const { userId, foodId, quantity, status, totalAmount, paymentStatus, deliveryAddress, deliveryStatus } = order;
  db.run(
    `INSERT INTO orders (userId, foodId, quantity, status, totalAmount, paymentStatus, deliveryAddress, deliveryStatus) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, 
      foodId, 
      quantity, 
      status || 'Pending',
      totalAmount || 0,
      paymentStatus || 'Pending',
      deliveryAddress || '',
      deliveryStatus || 'Preparing'
    ],
    function (error) {
      callback(error, { id: this?.lastID, ...order });
    }
  );
};

// Update an existing order.
const updateOrder = (id, order, callback) => {
  const { userId, foodId, quantity, status, totalAmount, paymentStatus, deliveryAddress, deliveryStatus } = order;
  db.run(
    `UPDATE orders 
     SET userId = ?, foodId = ?, quantity = ?, status = ?, 
         totalAmount = ?, paymentStatus = ?, deliveryAddress = ?, deliveryStatus = ?
     WHERE id = ?`,
    [userId, foodId, quantity, status, totalAmount, paymentStatus, deliveryAddress, deliveryStatus, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Update only order status.
const updateOrderStatus = (id, status, callback) => {
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Update delivery status.
const updateDeliveryStatus = (id, deliveryStatus, callback) => {
  db.run(
    'UPDATE orders SET deliveryStatus = ? WHERE id = ?',
    [deliveryStatus, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Update payment status.
const updatePaymentStatus = (id, paymentStatus, callback) => {
  db.run(
    'UPDATE orders SET paymentStatus = ? WHERE id = ?',
    [paymentStatus, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Delete one order by id.
const deleteOrder = (id, callback) => {
  db.run('DELETE FROM orders WHERE id = ?', [id], function (error) {
    callback(error, this?.changes);
  });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updateDeliveryStatus,
  updatePaymentStatus,
  deleteOrder
};
