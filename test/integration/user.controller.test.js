const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

chai.should();
chai.use(chaiHttp);

describe('Manage users api/user', () => {
    describe('UC-201 register as new user', () => {
        it('When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                // Firstname ontbreekt
                email: 'user@example.com',
                lastName: 'van Gils',
                password: 'password'
            })
            .end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.equals(400)
                result.should.be.a('string').that.equals('firstName must be a string');
                done();
            });
        })
        //it('When required input is missing, return an error', (done) => {}) More testcases
    })
})