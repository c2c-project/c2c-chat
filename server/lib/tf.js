// TODO: 193
/**
 * Stick all your tensorflow code here for now
 * If you need more files feel free to create them.
 *
 * One thing you'll have to do is add the appropriate packages.
 * Don't forget to use yarn instead of npm! If you're having trouble
 * just contact me.
 *
 * Also, make sure you are adding these packages to the server's package.json and not the root or client's.
 *
 */

import * as toxicity from '@tensorflow-models/toxicity';
                                                                                                     
const threshold = 0.8

export default async function tf_toxicity(question){
    try{
        await toxicity.load(threshold).then(async model => {
            await model.classify(question).then(async predictions => {
                const return_value = {};
                await predictions.forEach(prediction=>{
                    return_value[prediction.label] = prediction.results[0].match
                })
                return {predictions: return_value};
            })
        })

    }catch(exception){
        console.log(exception)
        return { message: 'fail' };
    }
}
