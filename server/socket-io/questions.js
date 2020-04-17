import io from '.';

const ioQuestion = io.of('/questions');

/**
 * @description set the current question being asked
 * @arg {String} sessionid same as roomId
 * @arg {Object} question question doc to emit to connected clients
 */
export function setCurrentQuestion(sessionId, question) {
    ioQuestion.to(sessionId).emit('set-question', question);
}

/**
 * @description function to run on connection, joins the appropriate room
 * @arg {Object} socket given by socketio
 */
function onConnection(socket) {
    const { roomId } = socket.handshake.query;
    if (roomId) {
        socket.join(roomId);
    }
}

ioQuestion.on('connection', onConnection);

export default ioQuestion;
