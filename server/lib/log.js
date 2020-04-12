/* eslint-disable no-console */
const { NODE_NV } = process.env;
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
export default function Log() {
    const loggers = {
        Production: {
            info: () => {},
            err: () => {},
            print: () => {},
        },
        Development: {
            info: console.log,
            err: console.error,
            print: console.log,
        },
    };
    const myLogger = loggers[NODE_NV];
    return myLogger;
}
