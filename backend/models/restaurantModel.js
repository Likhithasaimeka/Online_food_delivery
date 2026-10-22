// Restaurant model handles restaurant CRUD operations.
const db = require('../config/db');

// Get all restaurants with optional location filter.
const getAllRestaurants = (location, callback) => {
  let query = 'SELECT * FROM restaurants';
  const params = [];

  if (location) {
    query += ' WHERE location = ?';
    params.push(location);
  }

  db.all(query, params, callback);
};

// Get restaurant by ID with its menu items.
const getRestaurantById = (id, callback) => {
  db.get('SELECT * FROM restaurants WHERE id = ?', [id], (error, restaurant) => {
    if (error) return callback(error);
    if (!restaurant) return callback(null, null);

    // Get foods for this restaurant
    db.all('SELECT * FROM foods WHERE restaurantId = ?', [id], (foodError, foods) => {
      if (foodError) return callback(foodError);
      restaurant.foods = foods || [];
      callback(null, restaurant);
    });
  });
};

// Get all unique locations.
const getAllLocations = (callback) => {
  db.all('SELECT DISTINCT location FROM restaurants ORDER BY location', [], callback);
};

// Create a new restaurant.
const createRestaurant = (data, callback) => {
  const { name, location, description, imageUrl, rating, deliveryTime } = data;
  db.run(
    'INSERT INTO restaurants (name, location, description, imageUrl, rating, deliveryTime) VALUES (?, ?, ?, ?, ?, ?)',
    [name, location, description || '', imageUrl || '', rating || 4.0, deliveryTime || '30-40 mins'],
    function (error) {
      callback(error, { id: this?.lastID, ...data });
    }
  );
};

// Update a restaurant.
const updateRestaurant = (id, data, callback) => {
  const { name, location, description, imageUrl, rating, deliveryTime } = data;
  db.run(
    'UPDATE restaurants SET name = ?, location = ?, description = ?, imageUrl = ?, rating = ?, deliveryTime = ? WHERE id = ?',
    [name, location, description, imageUrl, rating, deliveryTime, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Delete a restaurant.
const deleteRestaurant = (id, callback) => {
  db.run('DELETE FROM restaurants WHERE id = ?', [id], function (error) {
    callback(error, this?.changes);
  });
};

// Search restaurants and foods.
const search = (query, location, callback) => {
  let sql = `
    SELECT 'restaurant' as type, id, name, location, description, imageUrl, rating, deliveryTime
    FROM restaurants
    WHERE name LIKE ? OR description LIKE ?
  `;
  const params = [`%${query}%`, `%${query}%`];

  if (location) {
    sql += ' AND location = ?';
    params.push(location);
  }

  sql += `
    UNION
    SELECT 'food' as type, f.id, f.name, r.location, f.description, f.imageUrl, NULL as rating, NULL as deliveryTime
    FROM foods f
    LEFT JOIN restaurants r ON f.restaurantId = r.id
    WHERE f.name LIKE ? OR f.description LIKE ?
  `;
  params.push(`%${query}%`, `%${query}%`);

  if (location) {
    sql += ' AND r.location = ?';
    params.push(location);
  }

  db.all(sql, params, callback);
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getAllLocations,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  search
};
