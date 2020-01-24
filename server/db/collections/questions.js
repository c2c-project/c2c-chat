import { ObjectID } from 'mongodb';
import { mongo } from '..';

const findById = id =>
    mongo.then(db =>
        db
            .collection('questions')
            .find({ _id: new ObjectID(id) })
            .toArray()
            .then(x => x[0])
    );

const findBySession = ({ sessionId }) =>
    mongo.then(db =>
        db
            .collection('questions')
            .find({ sessionId })
            .toArray()
    );

const createQuestion = ({ question, sessionId, username, userId }) =>
    mongo.then(db =>
        db
            .collection('questions')
            .insertOne({ question, sessionId, username, userId })
    );
//193

const removeQuestion = ({ questionId, reason }) =>
    mongo.then(
        db =>
            db.collection('questions').updateOne(
                {
                    _id: new ObjectID(questionId)
                },
                { $set: { moderated: true, reason } }
            )
        // close();
    );
// TODO: 193
/**
 * Read the comment in chat.js first; I haven't created privileged actions for questions.js yet.
 */
const privilegedActions = (action, userDoc) => {

    const { roles } = userDoc;
    switch (action) {
        case 'REMOVE_QUESTION': {
            const requiredAny = ['admin', 'moderator'];
            return questionId => {
                if (Accounts.isAllowed(roles, { requiredAny })) {
                    return removeQuestion({
                        messageId,
                        reason: 'Removed by moderator'
                    });
                }
                console.log('TODO:  not allowed but trying to moderate');
                return Promise.reject(Error('Not allowed'));
            };
        }
        case 'AUTO_REMOVE_QUESTION': {
            return questionId => {
                const question = findById({questionId})
                if(question.toxic){
                    return removeQuestion({
                        questionId,
                        reason: 'Auto removed'
                    });
                }
            };
        }
        default: {
            throw new TypeError('Invalid action');
        }
    }
};

export default {
    findById,
    createQuestion,
    findBySession,
    removeQuestion,
    privilegedActions
};
