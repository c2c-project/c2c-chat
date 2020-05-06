import { ObjectID } from 'mongodb';
import { mongo } from '..';

const collectionName = 'user-access-list';

/**
 * @description creating an new object based on the sessionId in the database user-access-list collection
 * @arg {String} sessionId email data based on mg api docs
 * @returns {Promise}
 */
const createAccessList = ({ sessionId }) =>
    mongo.then((db) =>
        db.collection(collectionName).insertOne({
            sessionId,
            userlist: [],
            startTime: new Date(),
        })
    );

/**
 * @description get the attendies list object based on the session Id
 * @arg {String} sessionId corresponds to sessionId of the session
 * @returns {Object} the user list according to the sessionId
 */
const getAccessList = ({ sessionId }) => 
    mongo.then((db) => db.collection(collectionName).findOne({ sessionId }));

/**
 * @description internal function to use mg api to send email
 * @arg {String} sessionId corresponds to sessionId of the session
 * @arg {String} userId corresponds to userId of the user
 * @arg {Date} from corresponds to the time that user enter the room
 * @arg {Date} to corresponds to the time that user leave the room
 * @returns {Promise}
 */
const newUserAccessRecord = ({ accesslistId, userId, from, to}) => 
    mongo.then(db =>
        db
            .collection(collectionName)
            .updateOne(
                { _id: new ObjectID(accesslistId) },
                { $push: { userlist: { userId, from, to } } }
            )
    );

export default {
    createAccessList,
    getAccessList,
    newUserAccessRecord,
};
