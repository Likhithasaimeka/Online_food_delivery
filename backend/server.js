// Import required packages.
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env if present.
require('dotenv').config();

// Import database setup so tables initialize on server start.
require('./config/db');
// Import route modules.
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const walletRoutes = require('./routes/walletRoutes');
const UserController = require('./controllers/userController');
const RestaurantController = require('./controllers/restaurantController');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so frontend can call backend APIs.
app.use(cors());

// Parse JSON request bodies.
app.use(express.json());

// Serve uploaded profile images.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes.
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);

// Search endpoint.
app.get('/api/search', RestaurantController.searchAll);

// Serve static frontend build in production if available
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api') || request.path.startsWith('/uploads')) {
      return next();
    }
    response.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Health check route.
  app.get('/', (request, response) => {
    response.send('Online Food Delivery Backend is running');
  });
}

// Start server.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
