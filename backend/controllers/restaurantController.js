// Restaurant controller handles restaurant-related API requests.
const RestaurantModel = require('../models/restaurantModel');

// GET /api/restaurants?location=xyz
const getRestaurants = (request, response) => {
  const location = request.query.location;
  RestaurantModel.getAllRestaurants(location, (error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows);
  });
};

// GET /api/restaurants/:id
const getRestaurant = (request, response) => {
  RestaurantModel.getRestaurantById(request.params.id, (error, restaurant) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!restaurant) return response.status(404).json({ message: 'Restaurant not found' });
    return response.json(restaurant);
  });
};

// GET /api/restaurants/locations/all
const getLocations = (request, response) => {
  RestaurantModel.getAllLocations((error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows.map((r) => r.location));
  });
};

// POST /api/restaurants
const createRestaurant = (request, response) => {
  RestaurantModel.createRestaurant(request.body, (error, restaurant) => {
    if (error) return response.status(400).json({ message: error.message });
    return response.status(201).json(restaurant);
  });
};

// PUT /api/restaurants/:id
const updateRestaurant = (request, response) => {
  RestaurantModel.updateRestaurant(request.params.id, request.body, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Restaurant not found' });
    return response.json({ message: 'Restaurant updated successfully' });
  });
};

// DELETE /api/restaurants/:id
const deleteRestaurant = (request, response) => {
  RestaurantModel.deleteRestaurant(request.params.id, (error, changes) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'Restaurant not found' });
    return response.json({ message: 'Restaurant deleted successfully' });
  });
};

// GET /api/search?q=query&location=xyz
const searchAll = (request, response) => {
  const query = request.query.q || '';
  const location = request.query.location || '';

  if (!query) {
    return response.status(400).json({ message: 'Search query is required' });
  }

  RestaurantModel.search(query, location, (error, results) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(results);
  });
};

module.exports = {
  getRestaurants,
  getRestaurant,
  getLocations,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchAll
};
