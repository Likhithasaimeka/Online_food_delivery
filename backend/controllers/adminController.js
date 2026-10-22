// Admin controller handles secure admin-only operations.
const jwt = require('jsonwebtoken');
const adminConfig = require('../config/admin');
const AdminModel = require('../models/adminModel');
const UserModel = require('../models/userModel');
const FoodModel = require('../models/foodModel');
const OrderModel = require('../models/orderModel');
const db = require('../config/db');

// POST /api/admin/login
// Validates admin credentials stored in SQLite and returns a JWT.
const adminLogin = (request, response) => {
  const { email, password } = request.body;

  AdminModel.getAdmin((error, adminRow) => {
    if (error) return response.status(500).json({ message: error.message });
    const isDbAdmin = adminRow && adminRow.email === email && adminRow.password === password;
    const isDefaultAdmin = email === adminConfig.defaultEmail && password === adminConfig.defaultPassword;

    if (!isDbAdmin && !isDefaultAdmin) {
      return response.status(401).json({ message: 'Invalid admin credentials' });
    }

    const currentAdminEmail = isDbAdmin ? adminRow.email : adminConfig.defaultEmail;

    const token = jwt.sign(
      { role: 'admin', email: currentAdminEmail },
      adminConfig.jwtSecret,
      { expiresIn: '2h' }
    );

    return response.json({ token, admin: { email: currentAdminEmail, role: 'admin' } });
  });
};

// GET /api/admin/profile
// Returns current admin profile.
const getAdminProfile = (request, response) => {
  AdminModel.getAdmin((error, adminRow) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!adminRow) return response.status(404).json({ message: 'Admin not found' });
    return response.json({ email: adminRow.email, role: 'admin' });
  });
};

// PUT /api/admin/profile
// Updates admin email/password.
const updateAdminProfile = (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required' });
  }

  AdminModel.updateAdmin({ email, password }, (error, changes) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Admin not found' });
    return response.json({ message: 'Admin profile updated', email });
  });
};

// GET /api/admin/stats
// Returns total users, foods, and orders counts.
const getAdminStats = (request, response) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM users) AS totalUsers,
      (SELECT COUNT(*) FROM foods) AS totalFoods,
      (SELECT COUNT(*) FROM orders) AS totalOrders
  `;

  db.get(sql, [], (error, row) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(row || { totalUsers: 0, totalFoods: 0, totalOrders: 0 });
  });
};

// GET /api/admin/users
const getUsers = (request, response) => {
  UserModel.getAllUsers((error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows);
  });
};

// DELETE /api/admin/users/:id
const deleteUser = (request, response) => {
  UserModel.deleteUser(request.params.id, (error, changes) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'User not found' });
    return response.json({ message: 'User deleted successfully' });
  });
};

// PUT /api/admin/users/:id
// Updates user email/password.
const updateUserCredentials = (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required' });
  }

  UserModel.updateUserCredentials(request.params.id, { email, password }, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'User not found' });
    return response.json({ message: 'User credentials updated' });
  });
};

// GET /api/admin/foods
const getFoods = (request, response) => {
  FoodModel.getAllFoods((error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows);
  });
};

// POST /api/admin/foods
const createFood = (request, response) => {
  FoodModel.createFood(request.body, (error, food) => {
    if (error) return response.status(400).json({ message: error.message });
    return response.status(201).json(food);
  });
};

// PUT /api/admin/foods/:id
const updateFood = (request, response) => {
  FoodModel.updateFood(request.params.id, request.body, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Food not found' });
    return response.json({ message: 'Food updated successfully' });
  });
};

// DELETE /api/admin/foods/:id
const deleteFood = (request, response) => {
  FoodModel.deleteFood(request.params.id, (error, changes) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Food not found' });
    return response.json({ message: 'Food deleted successfully' });
  });
};

// GET /api/admin/orders
const getOrders = (request, response) => {
  OrderModel.getAllOrders((error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows);
  });
};

// PUT /api/admin/orders/:id
// Updates order status only.
const updateOrderStatus = (request, response) => {
  const { status } = request.body;

  if (!status) {
    return response.status(400).json({ message: 'Status is required' });
  }

  OrderModel.updateOrderStatus(request.params.id, status, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Order not found' });
    return response.json({ message: 'Order status updated successfully' });
  });
};

// PUT /api/admin/orders/:id/delivery-status
// Updates delivery status only.
const updateDeliveryStatus = (request, response) => {
  const { deliveryStatus } = request.body;

  if (!deliveryStatus) {
    return response.status(400).json({ message: 'Delivery status is required' });
  }

  OrderModel.updateDeliveryStatus(request.params.id, deliveryStatus, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Order not found' });
    return response.json({ message: 'Delivery status updated successfully' });
  });
};

module.exports = {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  getAdminStats,
  getUsers,
  updateUserCredentials,
  deleteUser,
  getFoods,
  createFood,
  updateFood,
  deleteFood,
  getOrders,
  updateOrderStatus,
  updateDeliveryStatus
};
