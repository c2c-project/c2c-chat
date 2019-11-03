import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index';
import usersRouter from './routes/users';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ message: 'error' });
});

module.exports = app;

// import express from 'express';
// import http from 'http';
// import socketIO from 'socket.io';

// const app = express();
// const server = http.Server(app);
// const io = socketIO(server);
// const port = process.env.PORT || 3000;

// io.on('connection', function(socket) {
//     socket.emit('new', { hello: 'world' });
//     socket.on('my other event', function(data) {
//         console.log(data);
//     });
// });

// server.listen(port, () => console.log(`Listening on port ${port}`));
