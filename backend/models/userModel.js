// Import shared database connection.
const db = require('../config/db');

// Return all users.
const getAllUsers = (callback) => {
  db.all('SELECT * FROM users', [], callback);
};

// Return one user by id.
const getUserById = (id, callback) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], callback);
};

// Return one user by email.
const getUserByEmail = (email, callback) => {
  db.get('SELECT * FROM users WHERE email = ?', [email], callback);
};

// Update user email and password (admin-only).
const updateUserCredentials = (id, user, callback) => {
  const { email, password } = user;
  db.run(
    'UPDATE users SET email = ?, password = ? WHERE id = ?',
    [email, password, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Insert a new user.
const createUser = (user, callback) => {
  const { name, email, password, profileImage, isVerified } = user;
  db.run(
    'INSERT INTO users (name, email, password, profileImage, isVerified) VALUES (?, ?, ?, ?, ?)',
    [name, email, password, profileImage || null, isVerified ?? 1],
    function (error) {
      callback(error, { id: this?.lastID, ...user });
    }
  );
};

// Update existing user details.
const updateUser = (id, user, callback) => {
  const { name, email, password, profileImage } = user;
  db.run(
    'UPDATE users SET name = ?, email = ?, password = ?, profileImage = ? WHERE id = ?',
    [name, email, password, profileImage || null, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Update profile fields only (name, email, profileImage).
const updateUserProfile = (id, user, callback) => {
  const { name, email, profileImage } = user;
  db.run(
    'UPDATE users SET name = ?, email = ?, profileImage = ? WHERE id = ?',
    [name, email, profileImage || null, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Update only the profile image.
const updateUserProfileImage = (id, profileImage, callback) => {
  db.run(
    'UPDATE users SET profileImage = ? WHERE id = ?',
    [profileImage || null, id],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Delete one user by id.
const deleteUser = (id, callback) => {
  db.run('DELETE FROM users WHERE id = ?', [id], function (error) {
    callback(error, this?.changes);
  });
};

// Return full user profile:
//   - user row (id, name, email, profileImage, createdAt)
//   - totalOrders count
//   - full orders list joined with foods (food name + price), newest first
// Uses two queries: one for the user row, one for all orders.
const getUserProfile = (id, callback) => {
  // SQL 1: Fetch the user row with an inline total-orders count.
  const userSql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.profileImage,
      u.createdAt,
      (
        SELECT COUNT(*)
        FROM orders
        WHERE userId = u.id
      ) AS totalOrders
    FROM users u
    WHERE u.id = ?
  `;

  // SQL 2: Fetch all orders for this user, joined with foods for name/price,
  //         sorted by newest createdAt first.
  const ordersSql = `
    SELECT
      o.id,
      o.quantity,
      o.status,
      o.createdAt,
      o.totalAmount,
      o.paymentStatus,
      o.deliveryAddress,
      o.deliveryStatus,
      f.name  AS foodName,
      f.price AS foodPrice
    FROM orders o
    JOIN foods f ON o.foodId = f.id
    WHERE o.userId = ?
    ORDER BY o.createdAt DESC
  `;

  // Run user query first, then fetch orders.
  db.get(userSql, [id], (userError, userRow) => {
    if (userError || !userRow) return callback(userError, null);

    db.all(ordersSql, [id], (ordersError, orderRows) => {
      if (ordersError) return callback(ordersError, null);

      // Merge user details and orders list into one result object.
      callback(null, { ...userRow, orders: orderRows || [] });
    });
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserCredentials,
  createUser,
  updateUser,
  updateUserProfile,
  updateUserProfileImage,
  deleteUser,
  getUserProfile
};
