// Admin model manages stored admin credentials.
const db = require('../config/db');

// Fetch single admin settings row.
const getAdmin = (callback) => {
  db.get('SELECT id, email, password FROM admin_settings WHERE id = 1', [], callback);
};

// Update admin email/password.
const updateAdmin = (admin, callback) => {
  const { email, password } = admin;
  db.run(
    'UPDATE admin_settings SET email = ?, password = ? WHERE id = 1',
    [email, password],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

module.exports = {
  getAdmin,
  updateAdmin
};
