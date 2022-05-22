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
const INSERT_USER = `INSERT INTO user (firstName, lastName, emailAdress, password, street, city) VALUES
("first", "last", "test@email.com", "secret","test", "test");`
 
let insertId = 1;

describe('Authenticate/login', () => {
    beforeEach((done) => {
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) throw error
                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err // not connected!
            
                        // Use the connection
                        connection.query(INSERT_USER, function (error, results, fields) {
                                // When done with the connection, release it.
                                connection.release()
            
                                // Handle error after the release.
                                if (error) throw error
                                insertId = results.insertId;
                                // Let op dat je done() pas aanroept als de query callback eindigt!
                                done()
                            }
                        )
                    })
                })
                }
            )
        })

        describe('UC-101 Login', () => {
            it('TC-101-1 Verplicht velt ontbreekt', (done) => {
                chai.request(server).post('/api/auth/login').send({
                    // emailAdress: "m.vaaldp@er.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400)
                    message.should.be.a('string').that.equals("email must be a string.");
                    done();
                });
            })

            it('TC-101-2 Niet valide email address', (done) => {
                chai.request(server).post('/api/auth/login').send({
                    emailAdress: "m.vaaldp",
                    password: "secret"
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400)
                    message.should.be.a('string').that.equals("The expression evaluated to a falsy value:\n\n  assert(emailRegex.test(req.body.emailAdress))\n");
                    done();
                });
            })

            it('TC-101-3 Niet valide wachtwoord', (done) => {
                chai.request(server).post('/api/auth/login').send({
                    emailAdress: "test@email.com",
                    password: "secret11"
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400)
                    message.should.be.a('string').that.equals("Password invalid");
                    done();
                });
            })

            it('TC-101-4 Gebruiker bestaat niet', (done) => {
                chai.request(server).post('/api/auth/login').send({
                    emailAdress: "janlul@email.com",
                    password: "secret11"
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404)
                    message.should.be.a('string').that.equals("User not found");
                    done();
                });
            })

            it('TC-101-5 Gebruiker successvol ingelogd', (done) => {
                chai.request(server).post('/api/auth/login').send({
                    emailAdress: "test@email.com",
                    password: "secret"
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { statusCode, results } = res.body;
                    statusCode.should.equals(200)
                    results.should.be.an('object').that.has.all.keys('id', 'firstName', 'lastName', 'emailAdress','token');
                    done();
                });
            })
        })
})