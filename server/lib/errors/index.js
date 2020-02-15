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
export const errorHandler = (err, res, cb) => {
    if (err instanceof ClientError) {
        res.statusMessage = err.message;
    } else {
        console.error(err);
    }
    res.status(400);

    if (cb) {
        cb();
    }
    res.send();
};
