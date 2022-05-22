const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
let controller = {
    validateMeal: (req, res, next) =>{
        let meal = req.body;
        let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cook, participants } = meal;

        try {
            assert(typeof name === 'string', 'name must be a string')
            assert(typeof description === 'string', 'description must be a string')
            assert(typeof isActive === 'boolean', 'isActive must be a boolean')
            assert(typeof isVega === 'boolean', 'isVega must be a boolean')
            assert(typeof isVegan === 'boolean', 'isVegan must be a boolean')
            assert(typeof isToTakeHome === 'boolean', 'isToTakeHome must be a boolean')
            assert(typeof dateTime === 'string', 'dateTime must be a string')
            assert(typeof imageUrl === 'string', 'imageUrl must be a string')
            assert(typeof allergenes === 'object', 'allergenes must be an array')
            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number')
            assert(typeof price === 'number', 'price must be a number')

        } catch (error) {
            const err = {
                status: 400,
                message: error.message
            }

            next(err)
        }

        next();
    },
    addMeal: function(req, res) {
        const id = parseInt(req.userId);
        let meal = req.body;

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('SELECT * FROM user WHERE id = ?', [id], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if(error) {
                    console.error('Error in DB');
                    console.debug(error);
                    return;
                } else {
                    meal.cook = results[0]
                    meal.participants = results[0];
                    connection.query('INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.imageUrl, [meal.allergenes], meal.maxAmountOfParticipants, meal.price, req.userId] ,function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release();
                    
                        // Handle error after the release.
                        if (error) {
                            res.status(409).json({
                                status: 409,
                                message: error.message
                            })
                            console.log(error)
                        } else {
                            res.status(201).json({
                                status: 201,
                                result: {
                                    id: results.insertId,
                                    ...meal
                                }
                            })
                        }
                    });
                }
            });
        });
    },
    getAllMeals: function(req, res) {
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('SELECT * FROM meal;', function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) throw error;
        
                res.status(200).json({
                    status: 200,
                    result: results
                })
            });
        });
    },
    getMealById: function(req, res) {
        const mealId = parseInt(req.params.id);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('SELECT * FROM meal WHERE id = ?', [mealId], function (error, results, fields) {
                const meal = results
                if(meal && meal.length) {
                    connection.query('SELECT * FROM user WHERE id = ?', [meal[0].cookId], function (error, results, fields) {
                        const cook = results[0];
                        connection.query('SELECT userId FROM meal_participants_user WHERE mealId = ?', [meal[0].id], function (error, results, fields) {
                        connection.release();
                        let fullMeal = {
                            "id": meal[0].id,
                            "isActive": meal[0].isActive,
                            "isVega": meal[0].isVega,
                            "isVegan": meal[0].isVegan,
                            "isToTakeHome": meal[0].isToTakeHome,
                            "dateTime": meal[0].dateTime,
                            "maxAmountOfParticipants": meal[0].maxAmountOfParticipants,
                            "price": meal[0].price,
                            "imageUrl": meal[0].imageUrl,
                            "cook": cook,
                            "name": meal[0].name,
                            "description": meal[0].description,
                            "allergenes": [meal[0].allergenes],
                            "participants" : results
                        }
                        if(error) {
                            console.error('Error in DB');
                            console.debug(error);
                            return;
                        } else {
                            res.status(200).json({
                                status: 200,
                                result: fullMeal
                            })
                        }
                    })
                })
                } else {
                    res.status(404).json({
                        status: 404,
                        message: 'Meal not found!'
                    })
                }               
            });
        });
    },
    // updateMealById: function(req, res) {
    //     const userId = parseInt(req.params.userId);
    //     let updatedUser = req.body

    //     dbconnection.getConnection(function(err, connection) {
    //         if (err) throw err; // not connected!
           
    //         // Use the connection
    //         const query = "UPDATE user SET " + Object.keys(updatedUser).map(key => `${key} = ?`).join(", ") + " WHERE id = ?";
    //         const parameters = [...Object.values(updatedUser), userId];
    //         connection.query(query, parameters, function (error, results, fields) {
    //             // When done with the connection, release it.
    //             connection.release();
            
    //             // Handle error after the release.
    //             if (error) {
    //                 res.status(400).json({
    //                     status: 400,
    //                     message: error.message
    //                 })
    //                 return;
    //             } else if(results.affectedRows === 1) {
    //                 res.status(200).json({
    //                     status: 200,
    //                     message: 'User successfully updated',
    //                     result: {
    //                         id: userId,
    //                         ...updatedUser
    //                     }
    //                 })
    //             } else {
    //                 res.status(400).json({
    //                     status: 400,
    //                     message: 'User not found'
    //                 })
    //             }
    //         });
    //     });
    // },
    deleteMealById: function(req, res) {
        const mealId = parseInt(req.params.id);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('DELETE FROM meal WHERE id = ?;', [mealId], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) {
                    console.log(error);
                    return;
                } else if(results.affectedRows === 0) {
                    res.status(400).json({
                        status: 400,
                        message: 'Meal does not exist'
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        message: 'Meal deleted successfully',
                        result: results
                    })
                }
            });
        });
    }
}
module.exports = controller