import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
// import Clipper from '../Clipper';

function VideoPlayer({ url }) {
    return (
        <ReactPlayer
            url={url}
            playing={false}
            width='100%'
            playsinline
        />
    );
}

VideoPlayer.propTypes = {
    url: PropTypes.string.isRequired
};

export default VideoPlayer;
