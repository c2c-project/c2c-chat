import React, { useState, useEffect } from 'react';
import TimeLineItem from './TimeLineItem';
import ClipDialog from './ClipDialog';

import './TimeLineItem.css';

export default function TimeLine({ timeStamp, playerTime }) {
    const [clips, setClipState] = useState([
        {
            text: 'Practice Clip',
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

    // const [newQuestion, setQuestion] = React.useState('New Question');

    const addToClips = newClip => {
        setClipState([...clips, newClip]);
    };

    const [currClip, setCurrClip] = React.useState(clips[0]);
    useEffect(() => {
        console.log(`Current item: ${currClip.text}`);
    }, [currClip]);
    const [editMode, setEditMode] = useState(false);
    useEffect(() => {
        console.log(`edit Mode On: ${editMode}`);
    }, [editMode]);

    function editClips(x) {
        console.log(`new time ${x.start} and ${x.end}`);

        clips.map(clip => {
            if (clip.text === currClip.text) {
                clip.start = x.start;
                clip.end = x.end;
                clip.text = x.question;
            }
            return clip;
        });
        // need reset currClip to null for ClipDialog
        // setCurrClip(null);
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
