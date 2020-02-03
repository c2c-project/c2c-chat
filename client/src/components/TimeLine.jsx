import React, { useState, useEffect } from 'react';
import TimeLineItem from './TimeLineItem';
import ClipDialog from './ClipDialog';

import './TimeLineItem.css';

export default function TimeLine({ timeStamp, playerTime }) {
    
    const [currClip, setCurrClip] = React.useState(null);
    useEffect(() => {
        if (currClip === null) {
            console.log('Current item is null');
        }else{
            console.log(`Current item: ${currClip.question}`);
        }
    }, [currClip]);

    const [clips, setClipState] = useState([
        {
            id: 0,
            question: 'Practice Clip',
            start: '0',
            end: '20',
            category: {
                tag: 'medium',
                color: '#018f69'
            },
            link: {
                text: 'Click Here'
            }
        }
    ]);
    useEffect(()=> {
        setCurrClip(null);
    },[clips]);

    // const [newQuestion, setQuestion] = React.useState('New Question');

    const addToClips = newClip => {
        setClipState([...clips, { ...newClip, id: clips.length }]);
    };

    const [editMode, setEditMode] = useState(false);
    useEffect(() => {
        console.log(`edit Mode On: ${editMode}`);
    }, [editMode]);

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

        // clips.map(clip => {
        //     if (clip.text === currClip.text) {
        //         clip.start = x.start;
        //         clip.end = x.end;
        //         clip.text = x.question;
        //     }
        //     return clip;
        // });
        // need reset currClip to null for ClipDialog
        // reset currClip back to Null.
        //      setCurrClip(null);
    }

    return (
        <div>
            <h1>Another TimeLine here</h1>
            <ClipDialog
                timeStamp={timeStamp}
                addClip={addToClips}
                currentClip={{ ...currClip }}
                editClips={editClips}
                editMode={editMode}
                editModeOff={() => {
                    setEditMode(false);
                    setCurrClip(null);
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
