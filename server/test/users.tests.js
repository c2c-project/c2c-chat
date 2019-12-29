import chai from 'chai';
import chaihttp from 'chai-http';
import server from '../app';

chai.use(chaihttp);

// NOTE: database must be seeded with a mod@example.com w/ password 1 for these to work properly
describe('users', function() {
    let jwt;
    describe('#login', function() {
        it('should reject the login with no username or password', function(done) {
            chai.request(server)
                .post('/api/users/login')
                .end(function(err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject a login with no password', function(done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: 'mod@example.com' })
                .end(function(err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should reject a login with incorrect password', function(done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: 'mod@example.com', password: '2' })
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should accept a valid username & password', function(done) {
            chai.request(server)
                .post('/api/users/login')
                .send({ username: 'mod@example.com', password: '1' })
                .end(function(err, res) {
                    res.should.have.status(200);
                    jwt = res.body.token;
                    done();
                });
        });
    });
    describe('#authenticate', function() {
        it('should accept a valid jwt', function(done) {
            chai.request(server)
                .post('/api/users/authenticate')
                .set('Authorization', `bearer ${jwt}`)
                .end(function(err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('should reject a tampered jwt', function(done) {
            chai.request(server)
                .post('/api/users/authenticate')
                // maybe think of more ways to tamper with the jwt?
                .set('Authorization', `bearer ${jwt}$`)
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
    });
});
