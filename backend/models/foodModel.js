// Import shared database connection.
const db = require('../config/db');

// Return all foods.
const getAllFoods = (callback) => {
  db.all('SELECT * FROM foods', [], callback);
};

// Return one food by id.
const getFoodById = (id, callback) => {
  db.get('SELECT * FROM foods WHERE id = ?', [id], callback);
};

// Insert a new food item.
const createFood = (food, callback) => {
  const { name, description, price, imageUrl } = food;
  db.run(
    'INSERT INTO foods (name, description, price, imageUrl) VALUES (?, ?, ?, ?)',
    [name, description, price, imageUrl],
    function (error) {
      callback(error, { id: this?.lastID, ...food });
    }
  );
};

// Update existing food item.
const updateFood = (id, food, callback) => {
  const { name, description, price, imageUrl } = food;
  db.run(
    'UPDATE foods SET name = ?, description = ?, price = ?, imageUrl = ? WHERE id = ?',
    [name, description, price, imageUrl, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Delete one food item by id.
const deleteFood = (id, callback) => {
  db.run('DELETE FROM foods WHERE id = ?', [id], function (error) {
    callback(error, this?.changes);
  });
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
};
