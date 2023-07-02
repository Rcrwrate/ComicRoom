import React, { useEffect, useRef } from 'react';
// import 'dplayer/dist/DPlayer.min.css';
import DPlayer from 'dplayer';

const VideoPlayer = ({ videoUrl }) => {
    const playerRef = useRef(null);

    useEffect(() => {
        const options = {
            video: {
                url: videoUrl,
                type: 'auto',
            },
        };
        const player = new DPlayer({
            container: playerRef.current,
            ...options,
        });
        return () => {
            player.destroy();
        };
    }, [videoUrl]);

    return <div ref={playerRef} />;
};

export default VideoPlayer;
