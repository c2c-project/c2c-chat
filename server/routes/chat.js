import express from 'express';
import Chat from '../lib/chat';

const router = express.Router();

router.get('/:roomId', function(req, res, next) {
    const { roomId } = req.params;
    Chat.findMessages({ sessionId: roomId }).then(r => res.json(r));
    // res.json({ message: 'Hello World' });
});

module.exports = router;
