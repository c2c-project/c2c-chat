import React, {useState, useRef} from 'react';
import ReactPlayer from 'react-player';


function VideoPlayer() {
    const [timeStamp, setTimeStamp] = useState(false);
    const player = useRef();
    

    const handleTimeStamp = ({played, loaded, playedSeconds, loadedSeconds}) => {
        // console.log(played);
        document.getElementById('header').innerHTML = playedSeconds;
        setTimeStamp(playedSeconds);
    }

    const displayPlayTime = () => {
        console.log('You clicked the button');
        console.log(timeStamp);
    }

    const handleClipEvent = () => {
        
        player.current.seekTo(10, 'seconds');
        
    }
    
    
    
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
            <h1 id='header'>
                Hello World
            </h1>

            <button type='button' onClick={displayPlayTime}>Log</button>
            <button type='button' onClick={handleClipEvent}>Clip</button>




        </div>
    );
}

export default VideoPlayer;
