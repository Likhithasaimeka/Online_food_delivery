// Import order model functions.
const OrderModel = require('../models/orderModel');

// GET /api/orders
const getOrders = (request, response) => {
  OrderModel.getAllOrders((error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows);
  });
};

// GET /api/orders/:id
const getOrder = (request, response) => {
  OrderModel.getOrderById(request.params.id, (error, row) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!row) return response.status(404).json({ message: 'Order not found' });
    return response.json(row);
  });
};

// POST /api/orders
const createOrder = (request, response) => {
  OrderModel.createOrder(request.body, (error, order) => {
    if (error) return response.status(400).json({ message: error.message });
    return response.status(201).json(order);
  });
};

// PUT /api/orders/:id
const updateOrder = (request, response) => {
  OrderModel.updateOrder(request.params.id, request.body, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Order not found' });
    return response.json({ message: 'Order updated successfully' });
  });
};

// DELETE /api/orders/:id
const deleteOrder = (request, response) => {
  OrderModel.deleteOrder(request.params.id, (error, changes) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Order not found' });
    return response.json({ message: 'Order deleted successfully' });
  });
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
};
