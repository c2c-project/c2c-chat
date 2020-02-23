import { Sessions, Questions, Chat } from '../db/collections';

const countToxicMessages = () => {};

const summarizeSession = sessionId => {
    // 1. find all Questions related to the particular session
    // 2. find all chat messages related to the particular session
    // 3. loop through to figure out wanted aggregate data
};

const summarizeSessionsByTopic = topic => {
    // 1. find all sessions by topic, you'd have this in an array
    // 2. loop through the array using the summarizeSession function
    // 3. loop again through the session summaries, in order to aggregate
};

export default {
    summarizeSession
};
