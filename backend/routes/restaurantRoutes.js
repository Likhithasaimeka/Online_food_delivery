// Restaurant routes for CRUD APIs.
const express = require('express');
const RestaurantController = require('../controllers/restaurantController');

const router = express.Router();

// Get locations before /:id to avoid conflict
router.get('/locations/all', RestaurantController.getLocations);
router.get('/', RestaurantController.getRestaurants);
router.get('/:id', RestaurantController.getRestaurant);
router.post('/', RestaurantController.createRestaurant);
router.put('/:id', RestaurantController.updateRestaurant);
router.delete('/:id', RestaurantController.deleteRestaurant);

module.exports = router;
