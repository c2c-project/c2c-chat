import express from 'express';
import * as toxicity from '@tensorflow-models/toxicity';
                                                                                                     
const router = express.Router();
const threshold = 0.8

/* GET home page. */
router.post('/toxicity', async function(req, res) {
    try{
        const { question } = req.body;
        await toxicity.load(threshold).then(async model => {
            await model.classify(question).then(async predictions => {
                console.log(predictions)
                const return_value = {};
                await predictions.forEach(prediction=>{
                    return_value[prediction.label] = prediction.results[0].match
                })

                return res.json({predictions: return_value})
            })
        })

    }catch(exception){
        return res.json({ message: 'fail' });
    }
    return res.json({ message: 'time out' });
});

module.exports = router;
