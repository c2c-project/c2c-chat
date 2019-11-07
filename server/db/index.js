import r from 'rethinkdb';
import { rethinkdb as config } from '../config';

function handler(err, connection) {
    console.log(connection);
    if (err) {
        console.error(err);
        process.exit(1);
        return;
    }
}

r.connect(config, handler);

function createDatabase() {
    
}


