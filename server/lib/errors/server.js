/**
 * Use this if you want to throw an error that DOES NOT get sent backto the client
 */
export default class ServerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServerError';
    }
}
