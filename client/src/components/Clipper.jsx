import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
// import Grid from './ClipGrid';
import TimeLine from './TimeLine';

function Clipper() {
    const [timeStamp, setTimeStamp] = useState(false);
    const [currPlayerTime, setPlayerTime] = useState(null);
    const player = useRef();
    // const grid = useRef();
    const [clipState, setClipState] = useState([
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
        // const newClip = {
        //     clipTitle: timeStamp,
        //     startTime: timeStamp,
        //     endTime: 15
        // };
        const newClip = {
            text: 'new Question',
            date: timeStamp,
            category: {
                tag: 'medium',
                color: '#018f69',
            },
            link: {
                url: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
                text: 'Click Here',
            }
        };
        setClipState([...clipState, newClip]);
    };


    const handleSetPlayerTime = (x) => {
        setPlayerTime(x);
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
            />
            <h1 id='header'>Hello World</h1>

            <button type='button' onClick={addToClips}>
                Clip
            </button>
            {/* <button type='button' onClick={handleClipEvent}>
                10 secs
            </button> */}

            {/* <Grid ref={grid} clips={clipState} clipEvent={handleClipEvent} playerTime={setPlayerTime} /> */}
            <TimeLine clips={clipState} playerTime={handleSetPlayerTime} />

        </div>
    );
}

export default Clipper;
