import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
// import Clipper from '../Clipper';

function VideoPlayer() {
    return (
        <ReactPlayer
            url='https://www.youtube.com/watch?v=qJf8N46OEMk'
            playing={false}
            width='100%'
            // heigh=''
            playsinline
        />
    );
}

// VideoPlayer.defaultProps = {
//     ref: {}
// };

// VideoPlayer.propTypes = {
//     ref: PropTypes.object
// };

export default VideoPlayer;
