import ClientError from './client';

export { default as ClientError } from './client';
export { default as ServerError } from './server';
/**
 * @arg err the error to handle
 * @arg res the response object
 * @arg cb optional callback
 * generic error handler -- easy to decorate
 * NOTE: sends the response
 */
export const errorHandler = (err, req, res, next) => {
    if (err instanceof ClientError) {
        res.statusMessage = err.message;

        // TODO: log internal error here
        if (process.env.NODE_ENV === 'development') {
            console.error(`Client Message: ${err.message}`);
            console.error(`Server Message: ${err.internalError}`);
        }
    } else {
        // TODO: proper logging here
        console.error(err);
    }

    res.status(400).send();
};
