const express = require('express')
const router = express.Router()

let database = [];
let id = 0;

// Make account for users
router.route('/api/user')
.post((req, res) => {
    let user = req.body
    if (database.filter(item => item.emailAdress === req.body.emailAdress).length > 0) {
        res.status(401).json({
            status: 401,
            message: req.body.emailAdress + " already exists!"
        })
    } else {
        id++;
        user = {
            id,
            ...user
        }
        database.push(user);
        res.status(201).json({
            status: 201,
            result: user
        })
    }
})

// Get all users
.get((req, res) => {
    res.status(200).json({
        status: 200,
        result: database
    })
})

// Requests own user profile
router.get('/api/user/profile', (req, res) => {
    res.send('Not realized yet.')
})

router.route('/api/user/:userId')
// Get single user by id
.get((req, res) => {
    const userId = parseInt(req.params.userId);

    let user = database.filter((item) => item.id === userId);

    if (user.length > 0) {
        res.status(200).json({
            status: 200,
            result: user
        })
    } else {
        res.status(404).json({
            status: 404,
            message: 'User not found'
        })
    }
})
// Update single user by id
.put((req, res) => {
    const userId = parseInt(req.params.userId);
    let updatedUser = req.body

    // Vind index van user object in database (array)
    index = database.findIndex((item => item.id === userId));

    if(index != -1 && !database.filter(item => item.emailAdress === req.body.emailAdress && item.id !== userId).length > 0) {
        database[index] = {
            id: userId,
            ...updatedUser
        }

        res.status(200).json({
            status: 200,
            result: database[index]
        })
    } else {
        res.status(400).json({
            status: 400,
            message: 'User not found or email address already in use!'
        })
    }
})

// Delete single user by id
.delete((req, res) => {
    const userId = parseInt(req.params.userId);

    // Vind index van user object in database (array)
    index = database.findIndex((item => item.id === userId));

    if(index != -1) {
        database.splice(index, 1)

        res.status(200).json({
            status: 200,
            message: 'Deleted user successfully',
            result: database
        })
    } else {
        res.status(400).json({
            status: 400,
            message: 'User not found!'
        })
    }
})

module.exports = router