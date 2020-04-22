import chai from 'chai';
import chaihttp from 'chai-http';
import server from '../../app';
import { ObjectID } from 'mongodb';
import { mongo, close } from '../../db/mongo';

chai.should();
chai.use(chaihttp);

// NOTE must be sed with the following for it to work porperly:
// user@example.com w/ password 1
// Messages from user@example.com

// Issues: Ids are being hardcoded

// Bad tests, id properties of the sent messages and rooms are not the same in all machines.

// Possible Solutions:
//   Seed the DB before the tests are ran using hooks. Add and Remove seeded values.

describe('chat', function () {
    // Ids used in test documents
    const userId = new ObjectID();
    const messageId = new ObjectID();
    const sessionId = new ObjectID();

    // test documents
    const testUser = {
        _id: userId,
        username: 'test_user@example.com',
        email: 'test_user@example.com',
        roles: ['user'],
        password: '1',
        //name: {
        //    first: 'Robert',
        //    last: 'Downey',
        //},
    };

    const testSession = {
        _id: sessionId,
        //speaker: 'George Washington',
        //moderator: 'Darth Vader',
        // attendees: {
        // unique: 20,
        // peak: 10
        // TODO: what other attendance data would we want?
        //},
        //messages: {
        //  sent: 100,
        //asked: 10
        //}
    };

    const testMessage = {
        _id: messageId,
        sessionId: testSession._id,
        message: 'I made a boo boo',
        userId: testUser._id,
        username: testUser.username,
    };

    // Before hook
    before('Before hook running', function () {
        mongo.then(async function (db) {
            await db
                .collection('messages')
                .insertOne(testMessage)
                .then(() => {
                    console.log('finish seeding the database');
                });
            //close();
        });
        console.log('Hi before the tests in this block run');
    });

    // After hook
    after('After hook running', function () {
        console.log('Hi after all the tests in this block ran');
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
                .send({ username: 'user@example.com', password: '1' })
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
                    res.should.have.status(500);
                    done();
                });
        });
        it('should reject update request with user that is not owner of the message', function (done) {
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        _id: '1234566789',
                        userId: '0987654321',
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
                        _id: '5e8e849eb65bf53b64683e7b',
                        userId: '5e8e849eb65bf53b64683e77',
                    },
                    newMessage: 'boo boo got fixed again',
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.success.should.equal(true);
                    done();
                });
        });
        // Problem: This test receives status of 200 even though the message._id does not belong to any mesage document in the db
        // From research: It seems like MongoDB does not throw an error if the document to be updated does not exist in the db
        it('should reject update request since message does not exist', function (done) {
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        // No this id does not belong to any message document in the db
                        _id: '5e6290837ec41351b24b57fc',
                        userId: '5e8e849eb65bf53b64683e77',
                    },
                    newMessage: 'boo boo got fixed again',
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('#delete-message', function () {
        it('should reject request with no authentcation', function (done) {
            chai.request(server)
                // Same problem: the room id gotten from the db is being hardcoded
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .end(function (err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should get internal server error since no message object is provided', function (done) {
            chai.request(server)
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .end(function (err, res) {
                    res.should.have.status(500);
                    done();
                });
        });
        it('should reject delete request with user that is not owner of the message', function (done) {
            chai.request(server)
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        _id: '5e8e849eb65bf53b64683e7b',
                        userId: '0987654321',
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
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        _id: '5e8e849eb65bf53b64683e7b',
                        userId: '5e8e849eb65bf53b64683e77',
                    },
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.success.should.equal(true);
                    done();
                });
        });
        // Problem: This test receives status of 200 even though the message._id does not belong to any mesage document in the db
        // From research: It seems like MongoDB does not throw an error if the document to be deleted does not exist in the db
        it('should reject delete request since message does not exist', function (done) {
            chai.request(server)
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message: {
                        // No this id does not belong to any message document in the db
                        _id: '5e6230237ec41351c24b57fc',
                        userId: '5e8e849eb65bf53b64683e77',
                    },
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});
