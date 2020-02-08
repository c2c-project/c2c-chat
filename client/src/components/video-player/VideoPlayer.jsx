import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
// import Clipper from '../Clipper';

function VideoPlayer({ url }) {
    return (
        <ReactPlayer
            url={url}
            playing={process.env.NODE_ENV === 'production'}
            width='100%'
            playsinline
            controls
        />
    );
}

VideoPlayer.propTypes = {
    url: PropTypes.string.isRequired
};

export default VideoPlayer;
