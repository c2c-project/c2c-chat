import createError from 'http-errors';
import express from 'express';
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

dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'client/build')));
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ message: 'error' });
});

export default app;
