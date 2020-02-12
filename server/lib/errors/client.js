/**
 * Use this if you DO want to send the error message back to the client
 */

export default class ClientError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ClientError';
    }
}
