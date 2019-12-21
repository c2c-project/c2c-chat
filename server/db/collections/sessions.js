import { mongo } from '..';

const findAllSessions = () =>
    mongo.then(db =>
        db
            .collection('sessions')
            .find()
            .toArray()
    );

export default {
    findAllSessions
};
