import { ObjectID } from 'mongodb';
import { mongo } from '..';

/**
 * All functions within this module assume verification has been done before the call occurs
 */

const addUser = userDoc =>
    mongo.then(db => {
        // eslint-disable-next-line
        db.collection('users').insertOne(userDoc, (err, r) => {
            console.log('TODO: addUser error checking');
        });
    });
const updateUser = () => {};
const removeUser = () => {};
const findByUsername = ({ username }) =>
    mongo.then(db =>
        db
            .collection('users')
            .find({ email: username })
            .toArray()
            .then(r => r[0])
    );

const findByUserId = _id =>
    mongo.then(db =>
        db
            .collection('users')
            .find({ _id: new ObjectID(_id) })
            .toArray()
            .then(r => r[0])
    );

export default {
    addUser,
    updateUser,
    removeUser,
    findByUsername,
    findByUserId
};
