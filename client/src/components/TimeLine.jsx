import React from 'react';
import TimeLineItem from './TimeLineItem';
import './TimeLineItem.css'

const data = [
    {
        text: 'First Blog Post',
        date: 'March 3 2017',
        category: {
            tag: 'medium',
            color: '#018f69',
        },
        link: {
            url: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            text: 'Click Here',
        }
    },
    {
        text: 'First Blog Post',
        date: 'March 3 2017',
        category: {
            tag: 'medium',
            color: '#018f69',
        },
        link: {
            url: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            text: 'Click Here',
        }
    },
    {
        text: 'First Blog Post',
        date: 'March 3 2017',
        category: {
            tag: 'medium',
            color: '#018f69',
        },
        link: {
            url: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            text: 'Click Here',
        }
    },
    {
        text: 'First Blog Post',
        date: 'March 3 2017',
        category: {
            tag: 'medium',
            color: '#018f69',
        },
        link: {
            url: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            text: 'Click Here',
        }
    },
];

export default function TimeLine() {
    
    return(
        <div className='timeline-container'>
            <h1>Insert TimeLine Here</h1>
            {data.map((x, index) => (
                <TimeLineItem data={x} key={index} />
            ))}
        </div>
    );
}