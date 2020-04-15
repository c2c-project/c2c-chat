/* eslint-disable no-console */
const { NODE_ENV } = process.env;
/**
 * @description Logger type return description
 * @typedef {Object} Log
 * @property {function} info prints info to the log
 * @property {function} err prints info to the error log
 * @property {function} print DEVELOPMENT ONLY prints info the console
 */

/**
 * @returns {Log} functions accesssing the logger
 */
function Log() {
    const loggers = {
        production: {
            info: () => {},
            err: () => {},
            print: () => {},
        },
        development: {
            info: console.log,
            err: console.error,
            print: console.log,
        },
    };
    const myLogger = loggers[NODE_ENV];
    return myLogger;
}

export default Log();
