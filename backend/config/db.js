// Import sqlite3 in verbose mode for better debugging details.
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define database file location inside the backend folder.
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create or open the SQLite database.
const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Database connection failed:', error.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Initialize all required tables for this project.
db.serialize(() => {
  // Users table stores account details.
  // createdAt is auto-filled with current timestamp on insert.
  // profileImage stores an optional URL for the user's avatar.
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profileImage TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      isVerified INTEGER DEFAULT 0
    )`
  );

  // Add missing user columns when upgrading existing databases.
  db.all('PRAGMA table_info(users)', [], (error, columns) => {
    if (error || !columns) return;

    const hasProfileImage = columns.some((column) => column.name === 'profileImage');
    const hasCreatedAt = columns.some((column) => column.name === 'createdAt');
    const hasIsVerified = columns.some((column) => column.name === 'isVerified');

    if (!hasProfileImage) {
      db.run('ALTER TABLE users ADD COLUMN profileImage TEXT');
    }

    if (!hasCreatedAt) {
      // SQLite cannot add a column with a non-constant default, so add it first,
      // then backfill existing rows.
      db.run('ALTER TABLE users ADD COLUMN createdAt TEXT');
      db.run('UPDATE users SET createdAt = CURRENT_TIMESTAMP WHERE createdAt IS NULL');
    }

      if (!hasIsVerified) {
        db.run('ALTER TABLE users ADD COLUMN isVerified INTEGER');
        db.run('UPDATE users SET isVerified = 1 WHERE isVerified IS NULL');
      }
    }
  );

  // Insert sample users if table is empty.
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row && row.count === 0) {
      db.run(
        `INSERT INTO users (name, email, password, isVerified)
         VALUES
         ('likkhi', 'sailikhitha68@gmail.com', '123456', 1),
         ('Demo User', 'demo@foodapp.com', '123456', 1)`
      );
      console.log('Sample user data inserted.');
    }
  });

  // Restaurants table stores restaurant information.
  db.run(
    `CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      imageUrl TEXT,
      rating REAL DEFAULT 4.0,
      deliveryTime TEXT DEFAULT '30-40 mins',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Insert sample restaurants if table is empty.
  db.get('SELECT COUNT(*) as count FROM restaurants', (err, row) => {
    if (row && row.count === 0) {
      db.run(
        `INSERT INTO restaurants (name, location, description, rating, deliveryTime)
         VALUES
         ('Food Paradise', 'Jubilee Hills', 'Best multi-cuisine restaurant', 4.5, '25-35 mins'),
         ('Spice Kitchen', 'Banjara Hills', 'Authentic Indian flavors', 4.3, '30-40 mins'),
         ('Fast Bites', 'Gachibowli', 'Quick service restaurant', 4.0, '20-30 mins')`
      );
      console.log('Sample restaurant data inserted.');
    }
  });

  // Foods table stores available food items.
  db.run(
    `CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      imageUrl TEXT,
      restaurantId INTEGER,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
    )`
  );

  // Add missing columns to foods table.
  db.all('PRAGMA table_info(foods)', [], (error, columns) => {
    if (error || !columns) return;

    const hasRestaurantId = columns.some((column) => column.name === 'restaurantId');

    if (!hasRestaurantId) {
      db.run('ALTER TABLE foods ADD COLUMN restaurantId INTEGER');
      // Assign existing foods to different restaurants
      db.run('UPDATE foods SET restaurantId = 1 WHERE id = 1');
      db.run('UPDATE foods SET restaurantId = 2 WHERE id = 2');
      db.run('UPDATE foods SET restaurantId = 3 WHERE id = 3');
    }
  });

  // Insert sample food items if table is empty.
  db.get('SELECT COUNT(*) as count FROM foods', (err, row) => {
    if (row && row.count === 0) {
      db.run(
        `INSERT INTO foods (name, description, price, imageUrl, restaurantId)
         VALUES
         ('Pizza', 'Delicious cheese pizza', 250, '', 1),
         ('Burger', 'Crispy chicken burger', 150, '', 3),
         ('Pasta', 'Creamy white sauce pasta', 200, '', 1),
         ('Biryani', 'Hyderabadi special biryani', 300, '', 2),
         ('Chicken Tikka', 'Grilled chicken tikka', 280, '', 2),
         ('Sandwich', 'Club sandwich', 120, '', 3)`
      );
      console.log('Sample food data inserted.');
    }
  });

  // Orders table stores placed order records.
  db.run(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      foodId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      status TEXT DEFAULT 'Pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (foodId) REFERENCES foods(id)
    )`
  );

  // OTP requests table stores temporary registration data.
  db.run(
    `CREATE TABLE IF NOT EXISTS otp_requests (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      otp TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      lastSentAt TEXT,
      requestCount INTEGER DEFAULT 0,
      windowStart TEXT
    )`
  );

  // Add missing columns for OTP rate limiting.
  // Remove password column if it exists (migration to new schema).
  db.all('PRAGMA table_info(otp_requests)', [], (error, columns) => {
    if (error || !columns) return;

    const hasPassword = columns.some((column) => column.name === 'password');
    const hasLastSentAt = columns.some((column) => column.name === 'lastSentAt');
    const hasRequestCount = columns.some((column) => column.name === 'requestCount');
    const hasWindowStart = columns.some((column) => column.name === 'windowStart');

    // If password column exists, recreate table without it.
    if (hasPassword) {
      db.run(
        `CREATE TABLE IF NOT EXISTS otp_requests_new (
          email TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          otp TEXT NOT NULL,
          expiresAt TEXT NOT NULL,
          lastSentAt TEXT,
          requestCount INTEGER DEFAULT 0,
          windowStart TEXT
        )`
      );
      db.run('INSERT INTO otp_requests_new (email, name, otp, expiresAt, lastSentAt, requestCount, windowStart) SELECT email, name, otp, expiresAt, lastSentAt, requestCount, windowStart FROM otp_requests');
      db.run('DROP TABLE otp_requests');
      db.run('ALTER TABLE otp_requests_new RENAME TO otp_requests');
      console.log('Migrated otp_requests table to remove password column');
    } else {
      if (!hasLastSentAt) db.run('ALTER TABLE otp_requests ADD COLUMN lastSentAt TEXT');
      if (!hasRequestCount) db.run('ALTER TABLE otp_requests ADD COLUMN requestCount INTEGER');
      if (!hasWindowStart) db.run('ALTER TABLE otp_requests ADD COLUMN windowStart TEXT');
    }
  });

  // User wallet table stores wallet balance for each user.
  db.run(
    `CREATE TABLE IF NOT EXISTS user_wallet (
      userId INTEGER PRIMARY KEY,
      balance REAL DEFAULT 0,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`
  );

  // Payments table stores all payment transactions.
  db.run(
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT DEFAULT 'Wallet',
      status TEXT DEFAULT 'Completed',
      transactionId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )`
  );

  // Add missing columns to orders table for payment tracking.
  db.all('PRAGMA table_info(orders)', [], (error, columns) => {
    if (error || !columns) return;

    const hasTotalAmount = columns.some((column) => column.name === 'totalAmount');
    const hasPaymentStatus = columns.some((column) => column.name === 'paymentStatus');
    const hasDeliveryAddress = columns.some((column) => column.name === 'deliveryAddress');
    const hasDeliveryStatus = columns.some((column) => column.name === 'deliveryStatus');

    if (!hasTotalAmount) db.run('ALTER TABLE orders ADD COLUMN totalAmount REAL');
    if (!hasPaymentStatus) db.run('ALTER TABLE orders ADD COLUMN paymentStatus TEXT DEFAULT "Pending"');
    if (!hasDeliveryAddress) db.run('ALTER TABLE orders ADD COLUMN deliveryAddress TEXT');
    if (!hasDeliveryStatus) db.run('ALTER TABLE orders ADD COLUMN deliveryStatus TEXT DEFAULT "Preparing"');
  });

  // Admin settings table stores admin credentials for login.
  db.run(
    `CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      email TEXT NOT NULL,
      password TEXT NOT NULL
    )`
  );

  // Seed admin credentials if missing.
  db.get('SELECT COUNT(*) as count FROM admin_settings', (error, row) => {
    if (row && row.count === 0) {
      db.run(
        'INSERT INTO admin_settings (id, email, password) VALUES (1, ?, ?)',
        [require('./admin').defaultEmail, require('./admin').defaultPassword]
      );
    }
  });
});

module.exports = db;
