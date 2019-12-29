import chai from 'chai';
import Accounts from '../lib/accounts';

describe('Accounts', function() {
    describe('#isAllowed()', function() {
        const userRoles = ['moderator'];

        it('should allow if there are no required roles', function() {
            chai.assert.equal(Accounts.isAllowed(userRoles, {}), true);
        });
        it('should reject if there are no user roles', function() {
            chai.assert.equal(Accounts.isAllowed([], {}), false);
        });
        it('should pass various valid use cases', function() {
            chai.assert.equal(
                Accounts.isAllowed(userRoles, {
                    requiredAll: ['moderator'],
                    requiredNot: ['speaker']
                }),
                true
            );
            chai.assert.equal(
                Accounts.isAllowed(userRoles, {
                    requiredAny: ['admin', 'moderator']
                }),
                true
            );
            chai.assert.equal(
                Accounts.isAllowed(userRoles, { requiredNot: ['speaker'] }),
                true
            );
        });
        it('should reject various invalid use cases', function() {
            chai.assert.equal(
                Accounts.isAllowed(userRoles, { requiredNot: ['moderator'] }),
                false
            );
            chai.assert.equal(
                Accounts.isAllowed(userRoles, {
                    requiredAll: ['admin', 'moderator']
                }),
                false
            );
            chai.assert.equal(
                Accounts.isAllowed(userRoles, {
                    requiredAny: ['admin', 'user']
                }),
                false
            );
        });
    });
});
