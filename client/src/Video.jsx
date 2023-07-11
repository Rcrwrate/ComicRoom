import React, { useEffect, useRef, useState } from 'react';
import DPlayer from 'dplayer';
import Artplayer from 'artplayer';

const DP = ({ ws }) => {
    const playerRef = useRef(null);
    // const [dp, setdp] = useState(null)

    useEffect(() => {
        var id = new URL(ws.setting.url).searchParams.get("UniqueId")
        if (id == null) { var id = "0000000" }
        const player = new DPlayer({
            container: playerRef.current,
            video: {
                url: ws.setting.url,
                type: 'auto',
            },
            danmaku: {
                id: id,
                api: `https://api.phantom-sea-limited.ltd/player/dmku/?ac=dm&id=${id}&more=`,
                // maximum: 1000,
                // addition: [`https://api.phantom-sea-limited.ltd/player/dmku/?ac=dm&id=${id}`],
                // user: 'Comic',
                // bottom: '15%',
                // unlimited: true,
                // speedRate: 0.5,
            },
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


function AP({ ws }) {
    const artRef = useRef();

    useEffect(() => {
        var id = new URL(ws.setting.url).searchParams.get("UniqueId")
        if (id == null) { var id = "0000000" }

        const player = new Artplayer({
            container: artRef.current,
            url: ws.setting.url,
            id: id,
            autoSize: true,
            playbackRate: ws.role == "Master",
            setting: ws.role == "Master",
            isLive: ws.role == "User",
            hotkey: true,
            pip: true,
            fullscreen: true,
            fullscreenWeb: true,
            miniProgressBar: true,
            layers: [{
                name: 'notice',
                html: `<p class="console-error"></p>`,
                tooltip: 'notice',
                style: {
                    position: 'absolute',
                    bottom: '70px',
                    left: '50px',
                },
            },]
        });

        function notice(msg) {
            player.layers.notice.innerText = msg
            setTimeout(() => { player.layers.notice.innerText = "" }, 3000)
        }
        player.notice = notice
        window.player = player
        if (ws.role == "User") {
            const ban = () => { player.notice("禁止操作") }
            player.video._play = player.video.play
            player.video._pause = player.video.pause
            // player.video._fastSeek = player.video.fastSeek

            player._play = () => { player.video._play() }
            player._pause = () => { player.video._pause() }
            player._seek = (t) => { player.video.currentTime = t }
            player.video.play = ban
            player.video.pause = ban
            // player.video.fastSeek = ban
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
            player.on("video:timeupdate", update)
            player.on("video:ratechange", update)
            player.on("video:seeking", update)
            player.on("pause", update)
            player.on("play", update)
        }
        return () => {
            if (player && player.destroy) {
                player.destroy(false);
            }
        };
    }, []);

    return <div className='mdui-container' style={{ width: "100%", height: 600, display: "flex" }} ref={artRef}>
    </div>
}


export default function Video({ ws }) {
    return <>
        {ws.setting.player === "DP" ? <DP ws={ws} /> : <AP ws={ws} />}
    </>
}
