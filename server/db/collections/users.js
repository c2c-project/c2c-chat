import { ObjectID } from 'mongodb';
import { mongo } from '..';

/**
 * All functions within this module assume verification has been done before the call occurs
 */

const addUser = userDoc =>
    mongo.then(db =>
        // eslint-disable-next-line
        db
            .collection('users')
            .insertOne(userDoc)
            .then(r => r.ops[0])
            .catch(e => console.log('TODO: addUser error checking', e))
    );

const updateUser = (doc, addition) => {
    mongo.then(db => {
        db.collection('users').updateOne(
            doc,
            addition
        )
        .catch(e => console.log(e))
    })
};

const removeUser = () => {};
const findByUsername = ({ username }) =>
    mongo.then(db =>
        db
            .collection('users')
            .find({ username })
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

const find = (...args) =>
    mongo.then(db =>
        db
            .collection('users')
            .find(...args)
            .toArray()
    );

export default {
    addUser,
    updateUser,
    removeUser,
    findByUsername,
    findByUserId,
    find
};
