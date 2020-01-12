import React, {createRef} from 'react';
// import ReactPlayer from 'react-player';
import Clipper from '../Clipper';


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
        </div>
        
    );
}

export default VideoPlayer;
