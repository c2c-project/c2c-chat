import { ObjectID } from 'mongodb';
import { mongo } from '..';

const userConnect = userId =>
    mongo.then(db =>
        // eslint-disable-next-line
        db
            .collection('user-connection')
            .insertOne({userID: new ObjectID(userId)})
            .then(r => r.ops[0])
            .catch(e => console.log('TODO: userConnect error checking', e))
    );

const userDisConnect = userId =>
    mongo.then(db =>
        // eslint-disable-next-line
        db
            .collection('user-connection')
            .remove({userID: new ObjectID(userId)})
            .then(r => r.ops[0])
            .catch(e => console.log('TODO: userDisConnect error checking', e))
    );

const userConnectNumber = () =>
    mongo.then(db =>
        // eslint-disable-next-line
        db
            .collection('user-connection')
            .find().count()
            .then(r => r.ops[0])
            .catch(e => console.log('TODO: userConnectNumber error checking', e))
    );

const userIsConnecting = userId => 
    mongo.then(db =>
        // eslint-disable-next-line
        db
            .collection('user-connection')
            .find({ _id: new ObjectID(userId) })
            .toArray()
            .then(r => r[0] !== null)
    );

export default {
    userConnect,
    userDisConnect,
    userConnectNumber

};
