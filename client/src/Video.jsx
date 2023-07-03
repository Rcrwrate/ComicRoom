import React, { useEffect, useRef, useState } from 'react';
// import 'dplayer/dist/DPlayer.min.css';
import DPlayer from 'dplayer';

const VideoPlayer = ({ ws }) => {
    const playerRef = useRef(null);
    // const [dp, setdp] = useState(null)

    useEffect(() => {
        const options = {
            video: {
                url: ws.setting.url,
                type: 'auto',
            },
        };
        const player = new DPlayer({
            container: playerRef.current,
            ...options,
        });
        window.player = player
        // setdp(player)
        if (ws.role == "User") {
            const ban = () => { player.notice("禁止操作") }
            player._play = player.play
            player._pause = player.pause
            player._speed = player.speed
            player._seek = player.seek
            player.play = ban
            player.pause = ban
            player.speed = ban
            player.seek = ban
            player._toggle = function () {
                if (this.video.paused) {
                    this._play();
                } else {
                    this._pause();
                }
            }
            ws.install(player)
        } else {
            const update = () => { ws.update(player) }
            player.on("timeupdate", update)
            player.on("pause", update)
            player.on("play", update)
        }
        return () => {
            player.destroy();
        };
    }, [ws.setting.url]);

    return <div ref={playerRef} />;
};

export default VideoPlayer;
