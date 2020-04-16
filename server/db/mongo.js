/* eslint-disable no-console */
import { MongoClient } from 'mongodb';

require('dotenv').config();

const { DB_URL } = process.env;


const dbName = 'c2c-chat-db';

const db = MongoClient.connect(DB_URL, {
    useUnifiedTopology: true
}).catch(err => console.log(err));

export const mongo = db.then(client => client.db(dbName));
export const close = () => db.then(client => client.close());