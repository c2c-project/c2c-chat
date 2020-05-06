import { ObjectID } from 'mongodb';
import { mongo } from '..';
import Accounts from '../../lib/accounts';
import { ClientError } from '../../lib/errors';

const collectionName = 'user-access-list';

const createAccessList = ({ sessionId }) =>
    mongo.then(db =>
        db
            .collection(collectionName)
            .insertOne({
                sessionId,
                userlist: new Array(),
                startTime: new Date()
            })
    );

const getAccessList = ({ sessionId }) => 
    mongo.then(db =>
        db
            .collection(collectionName)
            .findOne({ sessionId })
    )


const newUserAccessRecord = ({ accesslistId, userId, from, to}) => 
    mongo.then(db =>
        db
            .collection(collectionName)
            .updateOne(
                {_id: new ObjectID(accesslistId)},
                { $push: {userlist: {userId, from, to}}}
            )
    ); 


export default {
    createAccessList,
    getAccessList,
    newUserAccessRecord
};
    