import express from 'express';
import Chat from '../db/collections/chat';

const router = express.Router();

router.get('/:roomId', (req, res) => {
    const { roomId } = req.params;
    Chat.findMessages({ sessionId: roomId }).then(r => res.json(r));
});

module.exports = router;
