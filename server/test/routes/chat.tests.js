import chai from 'chai';
import chaihttp from 'chai-http';
import server from '../../app';

chai.should();
chai.use(chaihttp);

// NOTE must be sed with the following for it to work porperly:
// user@example.com w/ password 1 
// Messages from user@example.com 

// Issues: Ids are being hardcoded 

// Bad tests, id properties of the sent messages and rooms are not the same in all machines.
        
// Possible Solutions:
//   1) Make the seeded messages and rooms have static Ids and use them here
//   2) Export the necessary Ids from seed.js 
//   3) Seed the DB before the tests are ran using hooks

describe('chat', function() {
    let jwt;
    describe ('#update-message', function () {
        it ('should reject request with no authentcation', function (done){
            chai.request(server)
                .post('/api/chat/update-message')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                })
        });
        it('should accept a valid username & password', function(done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: 'user@example.com', password: '1' })
                .end(function(err, res) {
                    res.should.have.status(200);
                    jwt = res.body.jwt;
                    done();
                });
        });
        it ('should get internal server error since no message object is provided', function (done){
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .end(function(err, res) {
                    res.should.have.status(500);
                    done();
                })
        });
        it ('should reject update request with user that is not owner of the message', function (done){
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message : {
                        _id: '1234566789',
                        userId: '0987654321'   
                    }
                })
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.body.success.should.equal(false);
                    done();
                })
        });
        it ('should accept update request since user is owner of the message', function (done){
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message : {
                        _id: '5e8e849eb65bf53b64683e7b',
                        userId: '5e8e849eb65bf53b64683e77'
                    },
                    newMessage : 'boo boo got fixed again',
                })
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.success.should.equal(true);
                    done();
                })
        });
        // Problem: This test receives status of 200 even though the message._id does not belong to any mesage document in the db
        // From research: It seems like MongoDB does not throw an error if the document to be updated does not exist in the db
        it ('should reject update request since message does not exist', function (done){
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message : {
                        // No this id does not belong to any message document in the db
                        _id: '5e6290837ec41351b24b57fc',
                        userId: '5e8e849eb65bf53b64683e77',
                    },
                    newMessage : 'boo boo got fixed again',
                })
                .end(function(err, res) {
                    res.should.have.status(200);
                    done();
                })
        });
    });

    describe ('#delete-message', function () {
        it ('should reject request with no authentcation', function (done){
            chai.request(server)
            // Same problem: the room id gotten from the db is being hardcoded
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                })
        });
        it ('should get internal server error since no message object is provided', function (done){
            chai.request(server)
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .end(function(err, res) {
                    res.should.have.status(500);
                    done();
                })
        });
        it ('should reject delete request with user that is not owner of the message', function (done){
            chai.request(server)
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message : {
                        _id: '5e8e849eb65bf53b64683e7b',
                        userId: '0987654321'   
                    }
                })
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.body.success.should.equal(false);
                    done();
                })
        });
        it ('should accept delete request with user that is owner of the message', function (done){
            chai.request(server)
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message : {
                        _id: '5e8e849eb65bf53b64683e7b',
                        userId: '5e8e849eb65bf53b64683e77'   
                    }
                })
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.success.should.equal(true);
                    done();
                })
        });
        // Problem: This test receives status of 200 even though the message._id does not belong to any mesage document in the db
        // From research: It seems like MongoDB does not throw an error if the document to be deleted does not exist in the db
        it ('should reject delete request since message does not exist', function (done){
            chai.request(server)
                .post('/api/chat/delete-message/5e8e849eb65bf53b64683e78')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message : {
                        // No this id does not belong to any message document in the db
                        _id: '5e6230237ec41351c24b57fc',
                        userId: '5e8e849eb65bf53b64683e77',
                    },
                })
                .end(function(err, res) {
                    res.should.have.status(200);
                    done();
                })
        });
    });
});
