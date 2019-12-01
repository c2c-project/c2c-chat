/* eslint-disable no-console */
import mongo from 'mongodb';
import assert from 'assert';

const { MongoClient } = mongo;
const { DB_URL, DB_PORT } = process.env;

const url = `${DB_URL}:${DB_PORT}`;

// const dbName = 'c2c-chat-db';

MongoClient.connect(url, (err, client) => {
    assert.equal(null, err);
    console.log('Connected to mongo');

    // const db = client.db(dbName);
    client.close();
});
