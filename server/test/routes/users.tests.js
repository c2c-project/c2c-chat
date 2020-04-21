import chai from 'chai';
import chaihttp from 'chai-http';
import JWT from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import server from '../../app';
import Users from '../../db/collections/users';

chai.should();
chai.use(chaihttp);

// NOTE: database must be seeded with a mod@example.com w/ password 1 for these to work properly
describe('users', function () {
    let jwt;
    describe('#login', function () {
        it('should reject the login with no username or password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .end(function (err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject a login with no password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: 'mod@example.com' })
                .end(function (err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject a login with incorrect password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: 'mod@example.com', password: '2' })
                .end(function (err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should accept a valid username & password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: 'mod@example.com', password: '1' })
                .end(function (err, res) {
                    res.should.have.status(200);
                    jwt = res.body.jwt;
                    done();
                });
        });
    });
    describe('#authenticate', function () {
        it('should accept a valid jwt', function (done) {
            chai.request(server)
                .post('/api/users/authenticate')
                .set('Authorization', `bearer ${jwt}`)
                // .set('credentials', 'same-origin')
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('should reject a tampered jwt', function (done) {
            chai.request(server)
                .post('/api/users/authenticate')
                // maybe think of more ways to tamper with the jwt?
                .set('Authorization', `bearer ${jwt}$`)
                .end(function (err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
    });
    describe('#verification', function () {
        it('should reject an invalid userId', function (done) {
            chai.request(server)
                .post('/api/users/verification')
                .send({ userId: new ObjectID() })
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
                    }
                    res.should.have.status(400);
                    done();
                });
        });
        it('should accept a valid userId', function (done) {
            Users.findByEmail('admin@example.com').then((doc) => {
                const { _id } = doc;
                chai.request(server)
                    .post('/api/users/verification')
                    .send({ userId: _id })
                    .end(function (err, res) {
                        if (err) {
                            console.error(err);
                        }
                        res.should.have.status(200);
                        done();
                    });
            });
        });
    });
    describe('#request-password-reset', function () {
        it('should accept valid email', function (done) {
            chai.request(server)
                .post('/api/users/request-password-reset')
                .send({ form: { email: 'admin@example.com' } })
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
                    }
                    res.should.have.status(200);
                    done();
                });
        });
        it('should reject undefined email', function (done) {
            chai.request(server)
                .post('/api/users/request-password-reset')
                .send({ form: { email: undefined } })
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
                    }
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject invalid email', function (done) {
            chai.request(server)
                .post('/api/users/request-password-reset')
                .send({ form: { email: 'invalidEmail' } })
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
                    }
                    res.should.have.status(400);
                    done();
                });
        });
    });
    describe('#consume-password-reset-token', function () {
        it('should accept valid token', function (done) {
            Users.findByEmail('admin@example.com')
                .then((doc) => {
                    const { _id } = doc;
                    JWT.sign(
                        { _id },
                        process.env.JWT_SECRET,
                        { expiresIn: '2m' },
                        (err, token) => {
                            chai.request(server)
                                .post('/api/users/consume-password-reset-token')
                                .send({
                                    token,
                                    form: {
                                        password: '1',
                                        confirmPassword: '1',
                                    },
                                })
                                .end(function (innerErr, res) {
                                    if (innerErr) {
                                        console.error(innerErr);
                                    }
                                    res.should.have.status(200);
                                    done();
                                });
                        }
                    );
                })
                .catch((err) => {
                    console.error(err);
                });
        });
        it('should reject invalid token', function (done) {
            chai.request(server)
                .post('/api/users/consume-password-reset-token')
                .send({
                    form: { password: '1', confirmPassword: '1' },
                })
                .set('Authorization', 'bearer 123123')
                .set('Content-Type', 'application/json')
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
                    }
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject expired token', function (done) {
            Users.findByEmail('admin@example.com').then((doc) => {
                const { _id } = doc;
                JWT.sign(
                    { _id },
                    process.env.JWT_SECRET,
                    { expiresIn: '1s' },
                    (err, token) => {
                        setTimeout(function () {
                            return chai
                                .request(server)
                                .post('/api/users/consume-password-reset-token')
                                .send({
                                    token,
                                    form: {
                                        password: '1',
                                        confirmPassword: '1',
                                    },
                                })
                                .end(function (innerErr, res) {
                                    if (innerErr) {
                                        console.error(innerErr);
                                    }
                                    res.should.have.status(400);
                                    done();
                                });
                        }, 1500);
                    }
                );
            });
        });
        it('should reject mismatching password', function (done) {
            Users.findByEmail('admin@example.com').then((doc) => {
                const { _id } = doc;
                JWT.sign(
                    { _id },
                    process.env.JWT_SECRET,
                    { expiresIn: '2m' },
                    (err, token) => {
                        chai.request(server)
                            .post('/api/users/consume-password-reset-token')
                            .send({
                                token,
                                form: { password: '1', confirmPassword: '2' },
                            })
                            .end(function (err, res) {
                                res.should.have.status(400);
                                done();
                            });
                    }
                );
            });
        });
    });
});
