const express = require('express')
const router = express.Router()
const controller = require('../controllers/user.controllers')
const authController = require('../controllers/auth.controllers')



// Make account for users
router.route('/api/user')
.post(controller.validateUser, controller.addUser)

// Get all users
.get(controller.getAllUsers)

// Requests own user profile
router.get('/api/user/profile', authController.validateToken, controller.getUserProfile)

router.route('/api/user/:userId')
// Get single user by id
.get(authController.validateToken, controller.getUserById)
// Update single user by id
.put(authController.validateToken, controller.validateUpdatedUser, controller.updateUserById)

// Delete single user by id
.delete(authController.validateToken, controller.deleteUserById)

module.exports = router