    const express = require('express')
    const app = express()
    const port = process.env.PORT || 3000

    app.get('/', (req, res) => {
    res.send('Hello World!')
    })

    // Make account for users
    app.post('/api/user', (req, res) => {
        res.send('Account made successfully')
    })

    // Get all users
    app.get('/api/user', (req, res) => {
        res.send('Get all users')
    })

    // Requests own user profile
    app.get('/api/user/profile', (req, res) => {
        res.send('Get user profile')
    })

    app.route('/api/user/:id')
    // Get single user by id
    .get((req, res) => {
        res.send('Get user by id')
    })
    // Update single user by id
    .post((req, res) => {
        res.send('Updated user by id')
    })
    // Delete single user by id
    .delete((req, res) => {
        res.send('Deleted user by id')
    })

    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })

    app.use((req, res, next) => {
        res.status(404).send("Sorry can't find that!")
    })

    app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
    })
