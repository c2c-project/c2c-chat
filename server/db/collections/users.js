import { mongo } from '..';

/**
 * All functions within this module assume verification has been done before the call occurs
 */

const addUser = () => {};
const updateUser = () => {};
const removeUser = () => {};
const findByUsername = ({ username }) =>
    mongo.then(db =>
        db
            .collection('users')
            .find({ username })
            .toArray()
            .then(r => r[0])
    );

export default {
    addUser,
    updateUser,
    removeUser,
    findByUsername
};
