import { mongo } from '..';

/* DB LEVEL CRUD */
const createSimilarityCluster= ({
    centerQuestionId,
    subId
}) =>
    mongo.then(
        db =>
            db.collection('similarity').insertOne({
                centerQuestionId,
                subId
            })
        // close();
    );

const updateSimilarityCluster = ({ clusterId, centerQuestionId, subId }) => {
    mongo.then(db => {
        db.collection('similarity').updateOne(
            { _id: clusterId },
            { $set: { centerQuestionId, subId } }
        );
        // close();
    });
};

export default {
    createSimilarityCluster,
    updateSimilarityCluster
};
