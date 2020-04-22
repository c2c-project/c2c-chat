import chai from 'chai';
import Accounts from '../../lib/accounts';

describe('Accounts', function () {
    describe('#isAllowed()', function () {
        const userRoles = ['moderator'];

        it('should reject if there are no required roles', async function () {
            chai.assert.equal(await Accounts.isAllowed(userRoles, {}), false);
        });
        it('should reject if there are no user roles', async function () {
            chai.assert.equal(await Accounts.isAllowed([], {}), false);
        });
        it('should pass various valid use cases', async function () {
            chai.assert.equal(
                await Accounts.isAllowed(userRoles, {
                    requiredAll: ['moderator'],
                    requiredNot: ['speaker'],
                }),
                true
            );
            chai.assert.equal(
                await Accounts.isAllowed(userRoles, {
                    requiredAny: ['admin', 'moderator'],
                }),
                true
            );
            chai.assert.equal(
                await Accounts.isAllowed(userRoles, {
                    requiredNot: ['speaker'],
                }),
                true
            );
        });
        it('should reject various invalid use cases', async function () {
            chai.assert.equal(
                await Accounts.isAllowed(userRoles, {
                    requiredNot: ['moderator'],
                }),
                false
            );
            chai.assert.equal(
                await Accounts.isAllowed(userRoles, {
                    requiredAll: ['admin', 'moderator'],
                }),
                false
            );
            chai.assert.equal(
                await Accounts.isAllowed(userRoles, {
                    requiredAny: ['admin', 'user'],
                }),
                false
            );
        });
    });
});
