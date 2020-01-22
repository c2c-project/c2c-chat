import express from 'express';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { Series } from 'pandas-js';
const router = express.Router();

/* GET home page. */
router.post('/similarity', async function(req, res) {
    try {
        // Load the model.
        await use.load().then(async model => {
            // Embed an array of sentences.
            const sentences = ['Why won\'t California help anybody but foreigners.', 'Why will United States help anybody but foreigners'];
            await model.embed(sentences).then(async embeddings => {
                // `embeddings` is a 2D tensor consisting of the 512-dimensional embeddings for each sentence.
                // So in this example `embeddings` has the shape [2, 512].
                // await embeddings.print(true /* verbose */);
                const datas = embeddings.arraySync()// array of sentences
                console.log(datas)
                console.log((new Series(datas[0])).sub(new Series(datas[1])).std())
            });
        });
    } catch (exception) {
        console.log(exception);
        return res.json({ message: 'fail' });
    }
    return res.json({ message: 'time out' });
});

module.exports = router;
