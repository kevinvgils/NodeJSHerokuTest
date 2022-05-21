const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const jwt = require('jsonwebtoken');

const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey

let controller = {

    // UC-101 Login
    login: (req, res, next) => {
        dbconnection.getConnection((err, connection) => {
            if (err) {
                logger.error('Error getting connection from dbconnection')
                res.status(500).json({
                    error: err.toString(),
                    datetime: new Date().toISOString(),
                })
            }
            if (connection) {
                connection.query('SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?', [req.body.emailAdress], (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            logger.error('Error: ', err.toString())
                            res.status(500).json({
                                error: err.toString(),
                                datetime: new Date().toISOString(),
                            })
                        }
                        if (rows) {
                            if (rows && rows.length === 1 && rows[0].password == req.body.password) {
                                logger.info(
                                    'passwords DID match, sending userinfo and valid token'
                                )
                                const { password, ...userinfo } = rows[0]
                                const payload = {
                                    userId: userinfo.id,
                                }

                                jwt.sign(
                                    payload,
                                    jwtSecretKey,
                                    { expiresIn: '12d' },
                                    function (err, token) {
                                        logger.debug(
                                            'User logged in, sending: ',
                                            userinfo
                                        )
                                        res.status(200).json({
                                            statusCode: 200,
                                            results: { ...userinfo, token },
                                        })
                                    }
                                )
                            } else {
                                if(rows && rows.length === 0) {
                                    logger.info(
                                        'User not found'
                                    )
                                    res.status(404).json({
                                        status: 404,
                                        message: 'User not found',
                                        datetime: new Date().toISOString(),
                                    })
                                } else {
                                    res.status(400).json({
                                        status: 400,
                                        message: 'Password invalid',
                                        datetime: new Date().toISOString(),
                                    })
                                }
                            }
                        }
                    }
                )
            }
        })
    },

    validateLogin(req, res, next) {
        // Verify that we receive the expected input

        const emailRegex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);

        try {
            assert(typeof req.body.emailAdress === 'string', 'email must be a string.')
            assert(typeof req.body.password === 'string', 'password must be a string.')
            assert(emailRegex.test(req.body.emailAdress))
        } catch (ex) {
            const err = {
                status: 400,
                message: ex.message,
                datetime: new Date().toISOString(),
            }
            next(err)
        }
        next()
    },

    validateToken(req, res, next) {
        // logger.info('validateToken called')
        // logger.trace(req.headers)
        // The headers should contain the authorization-field with value 'Bearer [token]'
        const authHeader = req.headers.authorization
        if (!authHeader) {
            logger.warn('Authorization header missing!')
            res.status(401).json({
                status: 401,
                error: 'Authorization header missing!',
                datetime: new Date().toISOString(),
            })
        } else {
            // Strip the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    logger.warn('Not authorized')
                    res.status(401).json({
                        status: 401,
                        error: 'Not authorized',
                        datetime: new Date().toISOString(),
                    })
                }
                if (payload) {
                    logger.debug('token is valid', payload)
                    req.userId = payload.userId
                    next()
                }
            })
        }
    },

    validateDataOwner(req, res, next) {
        if(req.userId !== req.id) {
            res.status(403).json({
                status: 403,
                message: 'You are not the owner of this data!'
            })
        } else {
            next();
        }
    },

    validateMealOwner(req, res, next) {
        const mealId = parseInt(req.params.id);
        let cookId;

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('SELECT * FROM meal WHERE id = ?', [mealId], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if(error) {
                    console.error('Error in DB');
                    console.debug(error);
                    return;
                } else {
                    if (results && results.length ) {
                        cookId = results[0].cookId
                        if(req.userId !== cookId) {
                            res.status(403).json({
                                status: 403,
                                message: 'You are not the owner of this data!'
                            })
                        } else {
                            next();
                        }
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: 'Meal not found!'
                        })
                    }
                }
            });
        });
    }
}
module.exports = controller