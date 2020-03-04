import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import TimeLineItem from './TimeLineItem';
import ClipDialog from './ClipDialog';
import Fab from '../Fab';
import './TimeLineItem.css';

export default function TimeLine({ url }) {
    const player = useRef();
    const quickScroll = React.useRef(null);
    const [playVideo, setPlayVideo] = useState(true);

    const [timeFrame, setTimeFrame] = useState({
        start: 0,
        end: Number.MAX_SAFE_INTEGER
    });
    useEffect(() => {
        quickScroll.current.scrollIntoView({
            behavior: 'smooth'
        });
        player.current.seekTo(timeFrame.start, 'seconds');
        setPlayVideo(true);
    }, [timeFrame]);

    const [addMode, setAddMode] = useState(false);
    useEffect(() => {
        // console.log(`add Mode On: ${addMode}`);
    }, [addMode]);

    const [editMode, setEditMode] = useState(false);
    useEffect(() => {
        // console.log(`edit Mode On: ${editMode}`);
    }, [editMode]);

    const [currClip, setCurrClip] = React.useState({
        question: '',
        start: 0,
        end: 0
    });
    useEffect(() => {
        // if (currClip === null) {
        //     console.log('Current item is null');
        // } else if (
        //     currClip.question !== '' &&
        //     currClip.start !== 0 &&
        //     currClip.end !== 0
        // ) {
        //     console.log(
        //         `Current item: ${currClip.question} ${currClip.start} ${currClip.end}`
        //     );
        // }
    }, [currClip]);

    const [clips, setClipState] = useState([]);

    const addToClips = () => {
        setClipState([...clips, { ...currClip, id: clips.length }]);
    };

    function handleTimeStamp({ playedSeconds }) {
        if (playedSeconds >= timeFrame.end) {
            // setPlayVideo(false);
            player.current.seekTo(timeFrame.start, 'seconds');
        }
        document.getElementById('header').innerHTML = playedSeconds;
    }

    function editClips() {
        const newClips = [...clips];
        newClips[currClip.id] = currClip;
        setClipState(newClips);
        // setCurrClip(null);
    }
    function editCurrentClip(item) {
        setCurrClip(item);
    }

    return (
        <div>
            <div ref={quickScroll} />
            <ReactPlayer
                ref={player}
                url={url}
                playing={playVideo}
                width='100%'
                playsinline
                onProgress={handleTimeStamp}
            />
            <h1 id='header'>Another TimeLine</h1>

            <Fab
                onClick={() => {
                    // create new initial clip.
                    setPlayVideo(false);
                    setCurrClip({
                        question: '',
                        start: player.current.getCurrentTime(),
                        end: player.current.getCurrentTime() + 15,
                        category: {
                            tag: 'medium',
                            color: '#018f69'
                        },
                        link: {
                            text: 'Click Here'
                        }
                    });
                    setEditMode(false);
                    setAddMode(true);
                }}
            />

            <ClipDialog
                currentClip={currClip}
                confirm={editClips}
                openState={false || editMode}
                edit={editCurrentClip}
                modeOff={() => {
                    setEditMode(false);
                }}
            />

            <ClipDialog
                currentClip={currClip}
                confirm={addToClips}
                edit={editCurrentClip}
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
                            // console.log(`TimeFrame: ${x.start} ${x.end}`);
                            setTimeFrame({
                                start: x.start,
                                end: x.end
                            });
                        }}
                        onClickEdit={() => {
                            setCurrClip({ ...x });
                            setEditMode(true);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

TimeLine.defaultProps = {
    url: ''
};

TimeLine.propTypes = {
    url: PropTypes.string
};
