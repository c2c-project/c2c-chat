const mongoose = require('mongoose');

const {Schema} = mongoose;

const sessionModel = new Schema(
    {
        speaker: {type: String, required: true },
        moderator: {type: String, required: true },
        attendees: {
            unique: {type: Number, required: true},
            peak: {type: Number, required: true}
        },
        message: {
            sent: {type: String, required: true },
            asked: {type: String, required: true }
        },
        clips: [{
            question: String,
            start: Number,
            end: Number,
            category: {
                tag: String,
                color: String,
            }
        }]
    }
);

const Session = mongoose.model('Session', sessionModel);
module.exports = Session;