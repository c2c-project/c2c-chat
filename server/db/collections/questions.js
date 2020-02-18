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

const createQuestion = ({
    question,
    sessionId,
    username,
    userId,
    toxicity,
    toxicityReason
}) =>
    mongo.then(db =>
        db.collection('questions').insertOne({
            question,
            sessionId,
            username,
            userId,
            toxicity,
            toxicityReason
        })
    );
// 193

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
/*   
// Attempt to get aggregate to work...
const countQuestionsBySession = sessionId =>
    mongo.then(db =>
        db
            .collection('questions')
            .aggregate([
                {
                    "$group": {
                        "_id": sessionId,
                        "count": { "$sum": 1 }
                    }
                }
            ]).toArray(function (err, docs) {
                console.log(docs);
            })
    );*/

const countQuestionsBySession = sessionId =>
    mongo.then(db =>
        db
            .collection('questions')
            .find({ 'sessionId': sessionId }).count(function (err, docs) {
                console.log("session ", docs);    // returns the amount of questions per sessionId
            })
    );

const updateQuestionToxicity = ({ questionId, result, toxicityReason }) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: questionId },
            { $set: { toxicity: result, toxicityReason } }
        );
        // close();
    });


// TODO create an aggregate
// TODO: 193
/**
 * Read the comment in chat.js first; I haven't created privileged actions for questions.js yet.
 */

export default {
    findById,
    createQuestion,
    findBySession,
    countQuestionsBySession,
    removeQuestion,
    updateQuestionToxicity
};
