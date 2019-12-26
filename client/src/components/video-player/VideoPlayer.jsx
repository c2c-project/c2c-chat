import React from 'react';
import ReactPlayer from 'react-player';

function VideoPlayer() {
    return (
        <ReactPlayer
            url='https://www.youtube.com/watch?v=hHW1oY26kxQ'
            playing={false}
            width='100%'
            // heigh=''
            playsinline
        />
    );
}

export default VideoPlayer;
