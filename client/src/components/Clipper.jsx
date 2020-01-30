import React, { useState, useRef , useEffect } from 'react';
import ReactPlayer from 'react-player';
// import Grid from './ClipGrid';
import TimeLine from './TimeLine';


function Clipper() {
    const player = useRef();
    const quickScroll = React.useRef(null);
    const [playVideo, setPlayVideo]  = useState(true);
    
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

    //function is passed to the React-Player
    const handleTimeStamp = ({ played, loaded, playedSeconds, loadedSeconds}) => {
        // console.log(played);
        document.getElementById('header').innerHTML = playedSeconds;
        setTimeStamp(playedSeconds);
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
                url='https://www.youtube.com/watch?v=k52HWEr8Rv0'
                playing={playVideo}
                width='100%'
                // heigh=''
                playsinline
                onProgress={handleTimeStamp} />
            
            <h1 id='header'>Hello World</h1>
            
            <TimeLine 
                playerRef={player}
                timeStamp={timeStamp}
                playerTime={handleSetTimeFrame} />
        </div>
    );
}

export default Clipper;
