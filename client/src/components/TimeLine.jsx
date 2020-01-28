import React, { useEffect }  from 'react';
import TimeLineItem from './TimeLineItem';
import './TimeLineItem.css';
import Fab from './Fab';



export default function TimeLine({clips, clipEvent, playerTime}) {
    
    const [currClip, setCurrClip] = React.useState('hi');
    useEffect(() => {
        if(currClip)
            console.log(`Current item: ${currClip.text}`);
    },[currClip]);

    function handleSetCurrClip(x){
        setCurrClip(x);
    }

    return(
        <div>
            <h1>Another TimeLine here</h1>
            <div className='timeline-container'>
                {clips.map((x, index) => (
                    <TimeLineItem data={x} key={index} currentClip={handleSetCurrClip} playerTime={playerTime} />
                ))}
            </div>
            <Fab />
        </div>
        
    );
}