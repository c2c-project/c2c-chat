import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import Grid from './ClipGrid';

function Clipper() {
    const [timeStamp, setTimeStamp] = useState(false);
    const [currPlayerTime, setPlayerTime] = useState(5);
    const player = useRef();
    const grid = useRef();

    const [clipState, setClipState] = useState([
        {
            clipTitle: 'clip1',
            startTime: 12,
            endTime: 14
        },
        {
            clipTitle: 'clip2',
            startTime: 12,
            endTime: 14
        },
        {
            clipTitle: 'clip4',
            startTime: 12,
            endTime: 14
        },
        {
            clipTitle: 'clip5',
            startTime: 12,
            endTime: 14
        },
        {
            clipTitle: 'clip6',
            startTime: 12,
            endTime: 14
        },
        {
            clipTitle: 'clip7',
            startTime: 12,
            endTime: 14
        },
        {
            clipTitle: 'clip8',
            startTime: 12,
            endTime: 14
        },
        {
            clipTitle: 'clip9',
            startTime: 12,
            endTime: 14
        }
    ]);

    const handleTimeStamp = ({
        // eslint-disable-next-line no-unused-vars
        played,
        // eslint-disable-next-line no-unused-vars
        loaded,
        playedSeconds,
        // eslint-disable-next-line no-unused-vars
        loadedSeconds
    }) => {
        // console.log(played);
        document.getElementById('header').innerHTML = playedSeconds;
        setTimeStamp(playedSeconds);
    };

    const addToClips = () => {
        const newClip = {
            clipTitle: timeStamp,
            startTime: timeStamp,
            endTime: 15
        };
        setClipState([...clipState, newClip]);
    };

    const handleClipEvent = () => {
        // console.log('you clicked a button');
        player.current.seekTo(currPlayerTime, 'seconds');
    };

    

    return (
        <div>
            <ReactPlayer
                ref={player}
                url='https://www.youtube.com/watch?v=qJf8N46OEMk'
                playing={false}
                width='100%'
                // heigh=''
                playsinline
                onProgress={handleTimeStamp}
                clipEvent={handleClipEvent}
            />
            <h1 id='header'>Hello World</h1>

            <button type='button' onClick={addToClips}>
                Clip
            </button>
            <button type='button' onClick={handleClipEvent}>
                10 secs
            </button>

            <Grid ref={grid} clips={clipState} clipEvent={handleClipEvent} playerTime={setPlayerTime} />
        </div>
    );
}

export default Clipper;
