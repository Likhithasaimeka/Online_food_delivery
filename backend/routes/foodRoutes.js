const express = require("express");
const FoodController = require("../controllers/foodController");

const router = express.Router();

// CRUD Routes
router.get("/", FoodController.getFoods);
router.get("/:id", FoodController.getFood);
router.post("/", FoodController.createFood);
router.put("/:id", FoodController.updateFood);
router.delete("/:id", FoodController.deleteFood);

module.exports = router;
