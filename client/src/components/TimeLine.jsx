import React, { useState, useEffect } from 'react';
import TimeLineItem from './TimeLineItem';
import ClipDialog from './ClipDialog';
import Fab from './Fab';

import './TimeLineItem.css';

export default function TimeLine({ timeStamp, playerTime }) {
    
    const [addMode, setAddMode] = useState(false);
    useEffect(() => {
        console.log(`add Mode On: ${addMode}`);
    }, [addMode]);

    const [editMode, setEditMode] = useState(false);
    useEffect(() => {
        console.log(`edit Mode On: ${editMode}`);
    }, [editMode]);

    
    const [currClip, setCurrClip] = React.useState({
        question: '',
        start: 0,
        end:0,
    });
    useEffect(() => {
        if (currClip === null) {
            console.log('Current item is null');
        } else if(currClip.question !== '' && currClip.start !== 0 && currClip.end !== 0) {
            console.log(`Current item: ${currClip.question}`);
        }
    }, [currClip]);

    const [clips, setClipState] = useState([
        // {
        //     id: 0,
        //     question: 'Practice Clip',
        //     start: '0',
        //     end: '20',
        //     category: {
        //         tag: 'medium',
        //         color: '#018f69'
        //     },
        //     link: {
        //         text: 'Click Here'
        //     }
        // }
    ]);
    useEffect(() => {
    }, [clips]);

    // const [newQuestion, setQuestion] = React.useState('New Question');

    const addToClips = newClip => {
        setClipState([...clips, { ...newClip, id: clips.length }]);
    };

    
    function editClips(x) {
        console.log(`new time ${x.start} and ${x.end}`);

        const index = clips.findIndex(clip => clip.id === currClip.id);
        console.log(`Current index: ${index}`);

        const newClips = [...clips];
        newClips[index] = {
            ...newClips[index],
            start: x.start,
            end: x.end,
            question: x.question
        };
        setClipState(newClips);
        setCurrClip(null);
    }

    return (
        <div>
            <h1>Another TimeLine here</h1>
            <Fab
                onClick={() => {
                    // create new initial clip.
                    setEditMode(false);
                    setAddMode(true);
                }}
            />

            <ClipDialog 
                currentClip={{...currClip}}
                confirm={editClips}
                openState={false || editMode}
                modeOff={() =>{
                    setEditMode(false);
                }}    
            />

            <ClipDialog
                currentClip={{
                    question: '',
                    start: timeStamp,
                    end: timeStamp + 15
                }}
                confirm={addToClips}
                openState={false || addMode}
                modeOff={() => {
                    setAddMode(false);
                }}
            />

            <div className='timeline-container'>
                {clips.map((x, index) => (
                    <TimeLineItem
                        data={x}
                        key={index}
                        onClickPlay={() => {
                            playerTime(x.start, x.end);
                            // setCurrClip(x);
                        }}
                        onClickEdit={() => {
                            setCurrClip(x);
                            setEditMode(true);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// TimeLine.defaultProps = {
//     timeStamp: 0,
// }

// TimeLine.propTypes = {
//     timeStamp: PropTypes.number,
//     playerTime: PropTypes.func.isRequired,
// }
