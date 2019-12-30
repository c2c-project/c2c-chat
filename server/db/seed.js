/* eslint-disable no-console */
/* eslint-disable no-multi-str */
import assert from 'assert';
import { ObjectID } from 'mongodb';
import { mongo, close } from './mongo';
import Accounts from '../lib/accounts';

const userIds = [
    new ObjectID(),
    new ObjectID(),
    new ObjectID(),
    new ObjectID()
];
const users = [
    {
        _id: userIds[0],
        username: 'admin@example.com',
        email: 'admin@example.com',
        roles: ['admin', 'user', 'moderator', 'speaker'],
        password: '1',
        name: {
            first: 'Darth',
            last: 'Vader'
        }
    },
    {
        _id: userIds[1],
        username: 'mod@example.com',
        email: 'mod@example.com',
        roles: ['moderator', 'user'],
        password: '1',
        name: {
            first: 'George',
            last: 'Washington'
        }
    },
    {
        _id: userIds[2],
        username: 'speaker@example.com',
        email: 'speaker@example.com',
        roles: ['speaker', 'user'],
        password: '1',
        name: {
            first: 'Winnie',
            last: 'Pooh'
        }
    },
    {
        _id: userIds[3],
        username: 'user@example.com',
        email: 'user@example.com',
        roles: ['user'],
        password: '1',
        name: {
            first: 'Christopher',
            last: 'Robinson'
        }
    }
];

const sessionIds = [new ObjectID(), new ObjectID()];
const sessions = [
    {
        _id: sessionIds[0],
        speaker: 'George Washington',
        moderator: 'Darth Vader',
        attendees: {
            unique: 20,
            peak: 10
            // TODO: what other attendance data would we want?
        },
        messages: {
            sent: 100,
            asked: 10
        }
    },
    {
        _id: sessionIds[1],
        speaker: 'Abraham Lincoln',
        moderator: 'Zeus',
        attendees: {
            unique: 10,
            peak: 5
            // TODO: what other attendance data would we want?
        },
        messages: {
            sent: 50,
            asked: 5
        }
    }
];

const messages = [
    {
        _id: new ObjectID(),
        sessionId: sessionIds[0],
        message:
            'The first order recently tried to overthrow the Republic,\
         but you have seemingly refused to take a stance on the subject.\
           Will you take the time now to affirm your support for the First\
            Order and the empire as a whole?',
        sentOn: new Date()
    }
];

function seedSessions() {
    console.log('sessions');
    return mongo.then(db =>
        db.collection('sessions').insertMany(sessions, (err, r) => {
            assert.equal(null, err);
            assert.equal(2, r.insertedCount);
            // close();
        })
    );
}

function seedMessages() {
    console.log('messages');
    return mongo.then(db =>
        db.collection('messages').insertMany(messages, (err, r) => {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            // close();
        })
    );
}

function seedUsers() {
    console.log('users');
    const promises = users.map(({ username, password, ...rest }) =>
        Accounts.register(username, password, rest)
    );
    return Promise.all(promises);
}

Promise.all([seedUsers(), seedSessions(), seedMessages()]).then(() => {
    console.log('finished seeding, closing...');
    close();
});
