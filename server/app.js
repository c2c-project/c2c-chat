import createError from 'http-errors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import usersRouter from './routes/users';
import chatRouter from './routes/chat';
import sessionRouter from './routes/sessions';
import questionRouter from './routes/questions';
import analyticsRouter from './routes/analytics';
import './lib/passport';
import { errorHandler } from './lib/errors';

dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/users', usersRouter);
app.use('/api/chat', chatRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/questions', questionRouter);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build/index.html'));
    });
}

//Rate Limiters
const masterLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3000, // limit each IP to 3000 requests per windowMs
    message: 'Exceeded over 3000 requests in 10 minutes'
});

const strictLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: 'Exceeded over 20 requests in 10 minutes',
});

const relaxedLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Exceeded over 1000 requests in 10 minutes',
});

//Rate Limiting For All Routes
app.use(masterLimiter);

//Rate Limiting For Specific Routes
app.use('/register', strictLimiter);
app.use('/login', strictLimiter);
app.use('/request-password-reset', strictLimiter);
app.use('/consume-password-reset-token', strictLimiter);
app.use('/verification', strictLimiter);
app.use('/login-temporary', strictLimiter);
app.use('/authenticate', relaxedLimiter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(errorHandler);

export default app;
