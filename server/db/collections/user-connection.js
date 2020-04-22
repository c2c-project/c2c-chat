import { ObjectID } from 'mongodb';
import { mongo } from '..';

const userConnect = userId =>
    mongo.then(db =>
        // eslint-disable-next-line
        db
            .collection('user-connection')
            .insertOne(userId)
            .then(r => r.ops[0])
            .catch(e => console.log('TODO: userConnect error checking', e))
    );

const userDisConnect = userId =>
    mongo.then(db =>
        // eslint-disable-next-line
        db
            .collection('user-connection')
            .remove(userId)
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


export default {
    userConnect,
    userDisConnect,
    userConnectNumber

};
