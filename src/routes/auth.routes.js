const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controllers')



// Make account for users
router.route('/api/auth/login')
.post(authController.validateLogin, authController.login)


module.exports = router