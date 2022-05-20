    const express = require('express')
    const app = express()
    require('dotenv').config();
    const port = process.env.PORT || 3000
    const userRouter = require('./src/routes/user.routes')
    const mealRouter = require('./src/routes/meal.routes')
    const authRouter = require('./src/routes/auth.routes')
    const bodyParser = require('body-parser')

    app.use(bodyParser.json())

    app.get('/', (req, res) => {
        res.status(200).json({
            status: 200,
            result: "Hello, World!"
        })
    })

    app.use(userRouter)
    app.use(mealRouter)
    app.use(authRouter)
    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })

    app.use((req, res, next) => {
        res.status(404).json({
            status: 404,
            message: "Sorry can't find that!"
        })
    })

    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(err.status).json(err)
    })

    module.exports = app;
