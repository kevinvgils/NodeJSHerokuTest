const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
let controller = {
    validateUser: (req, res, next) =>{
        let user = req.body;
        let { emailAdress, password, firstName, lastName, city, street } = user;
        const emailRegex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);


        try {
            assert(typeof emailAdress === 'string', 'email must be a string')
            assert(typeof firstName === 'string', 'firstName must be a string')
            assert(typeof lastName === 'string', 'lastName must be a string')
            assert(typeof password === 'string', 'password must be a string')
            assert(typeof street === 'string', 'street must be a string')
            assert(typeof city === 'string', 'city must be a string')
            assert(emailRegex.test(req.body.emailAdress))



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
        let searchParams = req.query;

        const parameters = [...Object.values(searchParams)];
        let queryString = 'SELECT * FROM user'

        if(Object.keys(searchParams).length !== 0) {
            queryString += ' WHERE '
            let i = 1;
            Object.keys(searchParams).map(key => {
                if(Object.keys(searchParams).length !== i) {
                    queryString += key + ` LIKE '%${parameters.at(i - 1)}%' AND `;
                    i++
                } else {
                    queryString += key + ` LIKE '%${parameters.at(i - 1)}%'`
                }
            })
        }
        queryString += ';'


        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query(queryString, parameters, function (error, results, fields) {
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
        const id = parseInt(req.userId);

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
    getUserById: function(req, res) {
        const id = parseInt(req.params.id);

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
        const id = parseInt(req.params.id);
        let updatedUser = req.body

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            const query = "UPDATE user SET " + Object.keys(updatedUser).map(key => `${key} = ?`).join(", ") + " WHERE id = ?";
            const parameters = [...Object.values(updatedUser), id];
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
                            id: id,
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
        const id = parseInt(req.params.id);

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('DELETE FROM user WHERE id = ?;', [id], function (error, results, fields) {
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