const express = require('express')
const router = express.Router()
const controller = require('../controllers/user.controllers')



// Make account for users
router.route('/api/user')
.post(controller.validateUser, controller.addUser)

// Get all users
.get(controller.getAllUsers)

// Requests own user profile
router.get('/api/user/profile', controller.getUserProfile)

router.route('/api/user/:userId')
// Get single user by id
.get(controller.getUserById)
// Update single user by id
.put(controller.updateUserById)

// Delete single user by id
.delete(controller.deleteUserById)

module.exports = router