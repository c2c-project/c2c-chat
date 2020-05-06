import chai from 'chai';
import chaihttp from 'chai-http';
import { ObjectID } from 'mongodb';
import server from '../../app';
import { mongo, close } from '../../db/mongo';
import Accounts from '../../lib/accounts';

chai.should();
chai.use(chaihttp);

describe('chat', function () {
    // Ids used in test documents
    const userId = new ObjectID();
    const messageId = new ObjectID();
    const sessionId = new ObjectID();

    // test documents
    const testUser = {
        _id: userId,
        username: '__testuser__',
        email: '__testemail__@example.com',
        roles: ['user'],
        password: '1',
        confirmPass: '1',
    };

    const testSession = {
        _id: sessionId,
    };

    const testMessage = {
        _id: messageId,
        sessionId: testSession._id,
        message: 'I made a boo boo',
        userId: testUser._id,
        username: testUser.username,
    };

    // Before hook
    before('Before hook running', async function () {
        try {
            const db = await mongo;

            const a = db.collection('messages').insertOne(testMessage);
            const b = db.collection('sessions').insertOne(testSession);
            const c = Accounts.register(
                testUser.username,
                testUser.password,
                testUser.confirmPass,
                {
                    _id: testUser._id,
                }
            );

            return Promise.all([a, b, c]);
        } catch (error) {
            console.log(error);
            return Promise.reject();
        }
    });

    // After hook
    after('After hook running', async function () {
        try {
            const db = await mongo;
            const a = db.collection('messages').deleteOne({
                _id: testMessage._id,
            });

            const b = db.collection('sessions').deleteOne({
                _id: testSession._id,
            });

            // This is not actually deleting the user registered
            const c = db.collection('users').deleteOne({
                _id: testUser._id,
            });

            return Promise.all([a, b, c]);
        } catch (error) {
            console.log(error);
            return Promise.reject();
        }
        // console.log('Hi after all the tests in this block ran');
    });

    // variable to store jason web token
    let jwt;

    // Start of testing
    describe('#update-message', function () {
        it('should reject request with no authentcation', function (done) {
            chai.request(server)
                .post('/api/chat/update-message')
                .end(function (err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should accept a valid username & password', function (done) {
            chai.request(server)
                .post('/api/users/login')
                .send({
                    username: testUser.username,
                    password: testUser.password,
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    jwt = res.body.jwt;
                    done();
                });
        });
        it('should get internal server error since no message object is provided', function (done) {
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .end(function (err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject update request with user that is not owner of the message', function (done) {
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        _id: new ObjectID(),
                        userId: new ObjectID(),
                    },
                })
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.body.success.should.equal(false);
                    done();
                });
        });
        it('should accept update request since user is owner of the message', function (done) {
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        _id: testMessage._id,
                        userId: String(testMessage.userId),
                    },
                    newMessage: 'boo boo got fixed again',
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.success.should.equal(true);
                    done();
                });
        });
        // Note: MongoDB does not throw an error if the document to be updated does not exist in the db
        it('should accept update request even though message does not exist', function (done) {
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        // Note this id does not belong to any message document in the db
                        _id: new ObjectID(),
                        userId: testMessage.userId,
                    },
                    newMessage: 'boo boo got fixed again oopsie',
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('#delete-message', function () {
        const deleteMessageEndpoint = `/api/chat/delete-message/${testSession._id}`;

        it('should reject request with no authentcation', function (done) {
            chai.request(server)
                // Same problem: the room id gotten from the db is being hardcoded
                .post(deleteMessageEndpoint)
                .end(function (err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should get internal server error since no message object is provided', function (done) {
            chai.request(server)
                .post(deleteMessageEndpoint)
                .set('Authorization', `bearer ${jwt}`)
                .end(function (err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject delete request with user that is not owner of the message', function (done) {
            chai.request(server)
                .post(deleteMessageEndpoint)
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        _id: new ObjectID(),
                        userId: new ObjectID(),
                    },
                })
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.body.success.should.equal(false);
                    done();
                });
        });
        it('should accept delete request with user that is owner of the message', function (done) {
            chai.request(server)
                .post(deleteMessageEndpoint)
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        _id: testMessage._id,
                        userId: testMessage.userId,
                    },
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.success.should.equal(true);
                    done();
                });
        });
        // It seems like MongoDB does not throw an error when trying to delete a non-existing document
        it('should reject delete request since message does not exist', function (done) {
            chai.request(server)
                .post(deleteMessageEndpoint)
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        // No this id does not belong to any message document in the db
                        _id: new ObjectID(),
                        userId: testMessage.userId,
                    },
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});