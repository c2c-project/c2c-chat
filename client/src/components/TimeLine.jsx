import React from 'react';
import TimeLineItem from './TimeLineItem';
import './TimeLineItem.css'



export default function TimeLine({clips, clipEvent, playerTime}) {
    
    return(
        <div>
            <h1>TimeLine Here</h1>
            <div className='timeline-container'>
                {clips.map((x, index) => (
                    <TimeLineItem data={x} key={index} playerTime={playerTime} />
                ))}
            </div>
        </div>
        
    );
}