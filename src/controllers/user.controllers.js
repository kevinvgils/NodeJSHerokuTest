const assert = require('assert');
let database = [];
let id = 0;
const dbconnection = require('../../database/dbconnection')
let controller = {
    validateUser: (req, res, next) =>{
        let user = req.body;
        let { email, password, firstName, lastName } = user;

        try {
            assert(typeof email === 'string', 'email must be a string')
            assert(typeof firstName === 'string', 'firstName must be a string')
            assert(typeof lastName === 'string', 'lastName must be a string')
            assert(typeof password === 'string', 'password must be a string')


        } catch (error) {
            const err = {
                status: 400,
                result: error.message
            }
            next(err)
        }

        next();
    },
    addUser: function(req, res) {
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
        
                res.status(200).json({
                    status: 200,
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
            connection.query('SELECT * FROM user WHERE id = ' + userId, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) throw error;
        
                res.status(201).json({
                    status: 200,
                    result: results
                })
            });
        });
    },
    updateUserById: function(req, res) {
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
    },
    deleteUserById: function(req, res) {
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
    }
}
module.exports = controller