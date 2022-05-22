const express = require('express')
const router = express.Router()
const controller = require('../controllers/meal.controllers')
const authController = require('../controllers/auth.controllers')



// Make meals
router.route('/api/meal')
.post(authController.validateToken, controller.validateMeal, controller.addMeal)

// Get all meals
.get(controller.getAllMeals)

router.route('/api/meal/:id')

// Get single meal by id
.get(controller.getMealById)

// Update single meal by id
// .put(authController.validateToken, controller.validateUpdatedUser, controller.updateUserById)

// Delete single meal by id
.delete(authController.validateToken, authController.validateMealOwner, controller.deleteMealById)

module.exports = router