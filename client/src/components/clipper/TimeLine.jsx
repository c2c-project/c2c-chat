import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import TimeLineItem from './TimeLineItem';
import ClipDialog from './ClipDialog';
import Fab from '../Fab';
import './TimeLineItem.css';

export default function TimeLine({ url, timeStamp, playerTime }) {
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
        console.log(`add Mode On: ${addMode}`);
    }, [addMode]);

    const [editMode, setEditMode] = useState(false);
    useEffect(() => {
        console.log(`edit Mode On: ${editMode}`);
    }, [editMode]);

    const [currClip, setCurrClip] = React.useState({
        question: '',
        start: 0,
        end: 0
    });
    useEffect(() => {
        if (currClip === null) {
            console.log('Current item is null');
        } else if (
            currClip.question !== '' &&
            currClip.start !== 0 &&
            currClip.end !== 0
        ) {
            console.log(`Current item: ${currClip.question} ${currClip.start} ${currClip.end}`);
        }
    }, [currClip]);

    const [clips, setClipState] = useState([]);
    useEffect(() => {
        // console.log(clips);
    }, [clips]);

    const addToClips = newClip => {
        setClipState([...clips, { ...newClip, id: clips.length }]);
    };

    function handleTimeStamp({ playedSeconds }) {
        if (playedSeconds >= timeFrame.end) {
            // setPlayVideo(false);
            player.current.seekTo(timeFrame.start, 'seconds');
        }
        document.getElementById('header').innerHTML = playedSeconds;
    }

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
        // setCurrClip(null);
    }
    function editCurrentClip(item) {
        setCurrClip(item);
    }

    return (
        <div>
            <h1 id='header'>Another TimeLine</h1>
            <div ref={quickScroll} />
            <ReactPlayer
                ref={player}
                url={url}
                playing={playVideo}
                width='100%'
                playsinline
                onProgress={handleTimeStamp}
            />
            <Fab
                onClick={() => {
                    // create new initial clip.
                    setPlayVideo(false);
                    setCurrClip({
                        question: '',
                        start: player.current.getCurrentTime(),
                        end: player.current.getCurrentTime() + 15
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
                // currentClip={{
                //     question: '',
                //     start: player.getCurrentTime(),
                //     end: player.getCurrentTime() + 15
                // }}
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
                            // playerTime(x.start, x.end);
                            // setCurrClip(x);
                            console.log(`TimeFrame: ${x.start} ${x.end}`);
                            setTimeFrame({
                                start: x.start,
                                end: x.end,
                            });
                            // player.current.seekTo(x.start, 'seconds');
                        }}
                        onClickEdit={() => {
                            setCurrClip({...x});
                            setEditMode(true);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// TimeLine.defaultProps = {
//     timeStamp: 0,
// }

// TimeLine.propTypes = {
//     timeStamp: PropTypes.number,
//     playerTime: PropTypes.func.isRequired,
// }
