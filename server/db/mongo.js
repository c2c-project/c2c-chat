/* eslint-disable no-console */
import { MongoClient } from 'mongodb';

require('dotenv').config();

const { DB_URL, DB_PORT } = process.env;

const url = `${DB_URL}:${DB_PORT}`;

const dbName = 'c2c-chat-db';

const db = MongoClient.connect(url, {
    useUnifiedTopology: true
}).catch(err => console.log(err));

export const mongo = db.then(client => client.db(dbName));
export const close = () => db.then(client => client.close());