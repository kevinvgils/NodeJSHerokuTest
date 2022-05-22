process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require('../../src/config/config')

chai.should();
chai.use(chaiHttp);


/**
 * Db queries to clear and fill the test database before each test.
 */
 const CLEAR_MEAL_TABLE = 'DELETE FROM `meal`;'
 const CLEAR_PARTICIPANTS_TABLE = 'DELETE FROM `meal_participants_user`;'
 const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
 const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

 /**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
 */
const INSERT_USER = `INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city) VALUES
(1, "first", "last", "test@email.com", "secret","test", "test");`
 
let insertId = 1;

describe('Meals', () => {
    beforeEach((done) => {
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                if (error) throw error
                connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                    connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) throw error
                            connection.query(INSERT_USER, function (error, results, fields) {
                                    // Handle error after the release.
                                    if (error) throw error
                                    insertId = results.insertId;
                                    let INSERT_MEALS ='INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
                                                        "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50," + insertId + ")," +
                                                        "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50," + insertId + ");"
                                    // logger.debug(INSERT_MEALS);
                                    connection.query(INSERT_MEALS, function (error, results, fields) {
                                        if (error) throw error
                                        connection.release
                                        done()
                                    })
                                }
                            )
                        })
                    })
                }) 
            })
        })

        describe('UC-301 Maaltijd aanmaken', () => {
            it('TC-301-1 Verplicht velt ontbreekt', (done) => {
                chai.request(server).post('/api/meal/').set('authorization', 'Bearer ' + jwt.sign({ userId: insertId }, jwtSecretKey))
                .send({
                    // name:
                    description: 'adfaf',
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: new Date().toLocaleDateString(),
                    imageUrl: 'afdafa',
                    allergenes: [''],
                    maxAmountOfParticipants: 4,
                    price: 4.1
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400)
                    message.should.be.a('string').that.equals("name must be a string");
                    done();
                });
            })
            it('TC-301-2 Niet ingelogd', (done) => {
                chai.request(server).post('/api/meal/').send({
                    name: 'afasd',
                    description: 'adfaf',
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: new Date().toLocaleDateString(),
                    imageUrl: 'afdafa',
                    allergenes: [''],
                    maxAmountOfParticipants: 4,
                    price: 4.1
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(401)
                    message.should.be.a('string').that.equals("Authorization header missing!");
                    done();
                });
            })
            it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
                chai.request(server).post('/api/meal/').set('authorization', 'Bearer ' + jwt.sign({ userId: insertId }, jwtSecretKey))
                .send({
                    name: 'afdakf',
                    description: 'adfaf',
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: new Date().toLocaleDateString(),
                    imageUrl: 'afdafa',
                    allergenes: [''],
                    maxAmountOfParticipants: 4,
                    price: 4.1
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(201)
                    result.should.be.a('object').that.has.all.keys('id', 'name', 'description', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'dateTime', 'imageUrl', 'allergenes', 'maxAmountOfParticipants', 'price', 'cook', 'participants');
                    done();
                });
            })
        })

        describe('UC-303 Lijst van maaltijden ophalen', () => {
            it('TC-303-1 Lijst van maaltijden geretouneerd', (done) => {
                chai.request(server).get('/api/meal/')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(200)
                    result.should.be.an('array');
                    done();
                });
            })
        })

        describe('UC-304 Details van maaltijd opvragen', () => {
            it('TC-304-1 Maaltijd bestaat niet', (done) => {
                chai.request(server).get('/api/meal/6')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404)
                    message.should.be.a('string').that.equals('Meal not found!');
                    done();
                });
            })

            it('TC-304-2 Details van maaltijd geretouneerd', (done) => {
                chai.request(server).get('/api/meal/1')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(200)
                    result.should.be.an('object').that.has.all.keys('id', 'name', 'description', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'dateTime', 'imageUrl', 'allergenes', 'maxAmountOfParticipants', 'price', 'cook', 'participants');
                    done();
                });
            })
        })

        describe('UC-303 Lijst van maaltijden ophalen', () => {
            it('TC-303-1 Lijst van maaltijden geretouneerd', (done) => {
                chai.request(server).get('/api/meal/')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(200)
                    result.should.be.an('array');
                    done();
                });
            })
        })

        describe('UC-305 Maaltijden verwijderen', () => {
            // it('TC-305-2 Niet ingelogd', (done) => {
            //     chai.request(server).delete('/api/meal/2')
            //     .end((err, res) => {
            //         res.should.be.an('object');
            //         let { status, message } = res.body;
            //         status.should.equals(401)
            //         message.should.be.a('string').that.equals('Authorization header missing!');
            //         done();
            //     });
            // })

            it('TC-305-3 Niet eigenaar van data', (done) => {
                let notOwner = insertId + 1;
                chai.request(server).delete('/api/meal/1').set('authorization', 'Bearer ' + jwt.sign({ userId: notOwner }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(403)
                    message.should.be.an('string').that.equals('You are not the owner of this data!')
                    done();
                });
            })

            it('TC-305-4 Maaltijd bestaat niet', (done) => {
                chai.request(server).delete('/api/meal/69').set('authorization', 'Bearer ' + jwt.sign({ userId: insertId }, jwtSecretKey))
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404)
                    logger.error(err)
                    message.should.be.an('string').that.equals('Meal not found!')
                    done();
                });
            })

            // it('TC-305-5 Maaltijd succesvol verwijderd', (done) => {
            //     chai
            //     .request(server)
            //     .delete('/api/meal/2')
            //     .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
            //     .end((err, res) => {
            //         res.should.be.an('object');
            //         let { status, message } = res.body;
            //         status.should.equals(200)
            //         message.should.be.an('string').that.equals('You are not the owner of this data!')
            //         done();
            //     });
            // })
        })
})