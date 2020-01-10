import React, {useRef, createRef} from 'react';
import ReactPlayer from 'react-player';
import Clipper from '../Clipper';
import TimeLine from '../TimeLine';


function VideoPlayer() {
    const player = createRef();
    
    
    return (
        <div>
            {/* <ReactPlayer
                url='https://www.youtube.com/watch?v=qJf8N46OEMk'
                playing={false}
                width='100%'
                // heigh=''
                playsinline
                ref={player}
            /> */}
            <Clipper playerRef={player} />
            <TimeLine />
        </div>
        
    );
}

export default VideoPlayer;
