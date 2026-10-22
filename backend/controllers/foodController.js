// Import food model functions.
const FoodModel = require('../models/foodModel');

// GET /api/foods
const getFoods = (request, response) => {
  FoodModel.getAllFoods((error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows);
  });
};

// GET /api/foods/:id
const getFood = (request, response) => {
  FoodModel.getFoodById(request.params.id, (error, row) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!row) return response.status(404).json({ message: 'Food not found' });
    return response.json(row);
  });
};

// POST /api/foods
const createFood = (request, response) => {
  FoodModel.createFood(request.body, (error, food) => {
    if (error) return response.status(400).json({ message: error.message });
    return response.status(201).json(food);
  });
};

// PUT /api/foods/:id
const updateFood = (request, response) => {
  FoodModel.updateFood(request.params.id, request.body, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Food not found' });
    return response.json({ message: 'Food updated successfully' });
  });
};

// DELETE /api/foods/:id
const deleteFood = (request, response) => {
  FoodModel.deleteFood(request.params.id, (error, changes) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Food not found' });
    return response.json({ message: 'Food deleted successfully' });
  });
};

module.exports = {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood
};
