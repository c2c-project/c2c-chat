import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

export default function TimeLineItem({ data, onClickPlay, onClickEdit }) {
    return (
        // wrapper
        <div className='timeline-item'>
            <div className='timeline-item-content'>
                <span
                    className='tag'
                    style={{ background: data.category.color }}
                >
                    {data.category.tag}
                </span>
                <time>{data.start}</time>
                <p>{data.question}</p>
                {/* <a href={data.link.url}>
                    {data.link.text}
                </a> */}
                {/* <Button onClick={clipEvent}> Click Here</Button> */}
                <Button onClick={onClickPlay}>Click Here</Button>
                <Button onClick={onClickEdit} className='timeline-item-edit'>
                    Edit
                </Button>
                <span className='circle' />
            </div>
        </div>
        // <h1>Hello World</h1>
    );
}


TimeLineItem.propTypes = {
    data: PropTypes.shape({
        question: PropTypes.string,
        start: PropTypes.number,
        end: PropTypes.number,
        category: PropTypes.shape({
            tag: PropTypes.string,
            color: PropTypes.string,
        }),
        link: PropTypes.shape({
            text: PropTypes.string
        })
    }).isRequired,
    onClickPlay: PropTypes.func.isRequired,
    onClickEdit: PropTypes.func.isRequired,
}