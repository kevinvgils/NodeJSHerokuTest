const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
let controller = {
    validateUser: (req, res, next) =>{
        let user = req.body;
        let { emailAdress, password, firstName, lastName, city, street } = user;

        try {
            assert(typeof emailAdress === 'string', 'email must be a string')
            assert(typeof firstName === 'string', 'firstName must be a string')
            assert(typeof lastName === 'string', 'lastName must be a string')
            assert(typeof password === 'string', 'password must be a string')
            assert(typeof street === 'string', 'street must be a string')
            assert(typeof city === 'string', 'city must be a string')



        } catch (error) {
            const err = {
                status: 400,
                message: error.message
            }
            next(err)
        }

        next();
    },
    validateUpdatedUser: (req, res, next) =>{
        let user = req.body;
        let { emailAdress, password, firstName, lastName, street, city, isActive, phoneNumber } = user;

        try {
            assert(typeof emailAdress === 'string', 'emailAddress must be a string')
        } catch (error) {
            const err = {
                status: 400,
                message: error.message
            }
            next(err)
        }

        next();
    },
    addUser: function(req, res) {
        let user = req.body

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES (?, ?, ?, ?, ?, ?);', [user.firstName, user.lastName, user.street, user.city, user.password, user.emailAdress] ,function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) {
                    res.status(409).json({
                        status: 409,
                        message: error.message
                    })
                } else {
                    res.status(201).json({
                        status: 201,
                        result: {
                            id: results.insertId,
                            isActive: user.isActive || true,
                            phoneNumber: user.isActive || "-",
                            ...user
                        }
                    })
                }
            });
        });
    },
    getAllUsers: function(req, res) {
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('SELECT * FROM user;', function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) throw error;
        
                res.status(201).json({
                    status: 201,
                    result: results
                })
            });
        });
    },
    getUserProfile: function(req, res) {
        res.send('Not realized yet.')
    },
    getUserById: function(req, res) {
        const userId = parseInt(req.params.userId);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('SELECT * FROM user WHERE id = ?', [userId], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if(error) {
                    console.error('Error in DB');
                    console.debug(error);
                    return;
                } else {
                    if (results && results.length ) {
                        res.status(200).json({
                            status: 200,
                            result: results[0]
                        })
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: 'User not found!'
                        })
                    }
                }
            });
        });
    },
    updateUserById: function(req, res) {
        const userId = parseInt(req.params.userId);
        let updatedUser = req.body

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            const query = "UPDATE user SET " + Object.keys(updatedUser).map(key => `${key} = ?`).join(", ") + " WHERE id = ?";
            const parameters = [...Object.values(updatedUser), userId];
            connection.query(query, parameters, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) {
                    res.status(400).json({
                        status: 400,
                        message: error.message
                    })
                    return;
                } else if(results.affectedRows === 1) {
                    res.status(200).json({
                        status: 200,
                        message: 'User successfully updated',
                        result: {
                            id: userId,
                            ...updatedUser
                        }
                    })
                } else {
                    res.status(400).json({
                        status: 400,
                        message: 'User not found'
                    })
                }
            });
        });
    },
    deleteUserById: function(req, res) {
        const userId = parseInt(req.params.userId);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('DELETE FROM user WHERE id = ?;', [userId], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) {
                    console.log(error);
                    return;
                } else if(results.affectedRows === 0) {
                    res.status(400).json({
                        status: 400,
                        message: 'User does not exist'
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        message: 'User deleted successfully',
                        result: results
                    })
                }
            });
        });
    }
}
module.exports = controller