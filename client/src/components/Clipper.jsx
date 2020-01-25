import React, { useState, useRef , useEffect } from 'react';
import ReactPlayer from 'react-player';
import ClipDialog from './ClipDialog';
// import Grid from './ClipGrid';
import TimeLine from './TimeLine';


function Clipper() {
    const player = useRef();
    const quickScroll = React.useRef(null);
    const [playVideo, setPlayVideo]  = useState(true);
    const [clipState, setClipState] = useState([
        {
            text: 'Practice Clip',
            start: '0',
            end: '20',
            category: {
                tag: 'medium',
                color: '#018f69',
            },
            link: {
                text: 'Click Here',
            }
        },
    ]);
    const [timeFrame, setTimeFrame] = useState({
        start: 0,
        end: Number.MAX_SAFE_INTEGER,
    });
    useEffect(() => {
        quickScroll.current.scrollIntoView({
            behavior: 'smooth'
        });
        player.current.seekTo(timeFrame.start, 'seconds');
        setPlayVideo(true);
        console.log(`You just changed the time frame to: ${timeFrame.start} and ${timeFrame.end}`);
        

    },[timeFrame]);

    const [timeStamp, setTimeStamp] = useState(false);
    useEffect(() => {
        if(timeStamp != null && timeStamp >= timeFrame.end){
            player.current.seekTo(timeFrame.start, 'seconds');
            setPlayVideo(true);
        }
    },[timeStamp]);


    const handleTimeStamp = ({ played, loaded, playedSeconds, loadedSeconds}) => {
        // console.log(played);
        document.getElementById('header').innerHTML = playedSeconds;
        setTimeStamp(playedSeconds);
    };

   
    const addToClips = () => {
        const newClip = {
            text: 'new Question',
            start: timeStamp,
            end: 15,
            category: {
                tag: 'medium',
                color: '#018f69',
            },
            link: {
                text: 'Click Here',
            }
        };
        setClipState([...clipState, newClip]);
    };

    const handleSetTimeFrame = (beginClip, endClip) => {
        // unessessary for a re-render to seek this time.
        setTimeFrame({
            start: beginClip,
            end: endClip,
        });
    };

    return (
        <div>
            <div ref={quickScroll} />
            <ReactPlayer
                ref={player}
                url='https://www.youtube.com/watch?v=qJf8N46OEMk'
                playing={playVideo}
                width='100%'
                // heigh=''
                playsinline
                onProgress={handleTimeStamp}
            />
            <h1 id='header'>Hello World</h1>

            <button type='button' onClick={addToClips}>
                Clip
            </button>
            <ClipDialog />
            {/* <button type='button' onClick={handleClipEvent}>
                10 secs
            </button> */}

            {/* <Grid ref={grid} clips={clipState} clipEvent={handleClipEvent} playerTime={setPlayerTime} /> */}
            <TimeLine clips={clipState} playerTime={handleSetTimeFrame} />

        </div>
    );
}

export default Clipper;
