import React from 'react';



export default function TimeLineItem({data}) {
    // wrapper
    
    return(
        <div className='timeline-item'>
            <div className='timeline-item-content'>
                <span className='tag' style={{background: data.category.color}}>
                    {data.category.tag}
                </span>
                <time>{data.date}</time>
                <p>{data.text}</p>
                <a href={data.link.url}>
                    {data.link.text}
                </a>
                <span className='circle' />
            </div>
        </div>
        // <h1>Hello World</h1>
    );
}
    