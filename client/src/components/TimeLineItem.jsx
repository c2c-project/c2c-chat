import React from 'react';
import Button from '@material-ui/core/Button';


export default function TimeLineItem({data, currentClip, playerTime}) {
 

    return(
        // wrapper
        <div className='timeline-item'>
            <div className='timeline-item-content'>
                <span className='tag' style={{background: data.category.color}}>
                    {data.category.tag}
                </span>
                <time>{data.start}</time>
                <p>{data.text}</p>
                {/* <a href={data.link.url}>
                    {data.link.text}
                </a> */}
                {/* <Button onClick={clipEvent}> Click Here</Button> */}
                <Button onClick={() => {
                    playerTime(data.start, data.end);
                    // set current clip
                    currentClip(data);
                }}
                >
                Click Here
                </Button>
                <span className='circle' />
            </div>
        </div>
        // <h1>Hello World</h1>
    );
}
     