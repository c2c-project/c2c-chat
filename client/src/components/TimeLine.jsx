import React from 'react';
import TimeLineItem from './TimeLineItem';
import './TimeLineItem.css'



export default function TimeLine({clips, clipEvent, playerTime}) {
    
    return(
        <div className='timeline-container'>
            <h1> Insert TimeLine Here</h1>
            {clips.map((x, index) => (
                <TimeLineItem data={x} key={index} playerTime={playerTime} />
            ))}
        </div>
    );
}