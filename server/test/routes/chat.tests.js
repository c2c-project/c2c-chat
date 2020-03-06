import chai from 'chai';
import chaihttp from 'chai-http';
import server from '../../app';

chai.should();
chai.use(chaihttp);

// NOTE must be sed with the following for it to work porperly:
// user@example.com w/ password 1 
// Messages from user@example.com 

// Issues: Ids are being hardcoded 

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
                    done();
                })
        });
        it ('should accept update request since user is owner of the message', function (done){
            chai.request(server)
                .post('/api/chat/update-message')
                .set('Authorization', `bearer ${jwt}`)
                .send({
                    message : {
                        _id: '5e6290877bb41251b47b57fc',
                        userId: '5e6290877bb41251b47b57f8',
                    },
                    newMessage : 'boo boo got fixed',
                })
                .end(function(err, res) {
                    res.should.have.status(200);
                    done();
                })
        });
        // This test actually passes even tho the message_id does not belong to any mesage document
        
        // it ('should reject update request since message does not exist', function (done){
        //     chai.request(server)
        //         .post('/api/chat/update-message')
        //         .set('Authorization', `bearer ${jwt}`)
        //         .send({
        //             message : {
        //                 _id: '5e6290837bc41251b47b57fc',
        //                 userId: '5e6290877bb41251b47b57f8',
        //             },
        //             newMessage : 'boo boo got fixed',
        //         })
        //         .end(function(err, res) {
        //             res.should.have.status(200);
        //             done();
        //         })
        // });
    });
});
