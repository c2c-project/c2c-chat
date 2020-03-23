/**
 * Use this if you DO want to send the error message back to the client
 */

export default class ClientError extends Error {
    constructor(clientMessage, serverMessage = '') {
        super(clientMessage);
        this.name = 'ClientError';
        this.internalError = `${serverMessage}`;
    }
}
