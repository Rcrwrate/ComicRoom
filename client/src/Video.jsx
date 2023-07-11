import React, { useEffect, useRef, useState } from 'react';
import DPlayer from 'dplayer';
import Artplayer from 'artplayer';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';

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
        } else {
            const update = () => { ws.update(player) }
            player.on("timeupdate", update)
            player.on("pause", update)
            player.on("play", update)
        }
        ws.install(player)
        return () => {
            player.destroy();
        };
    }, [ws.setting.url]);

    return <div ref={playerRef} />;
};


function AP({ ws }) {
    const artRef = useRef();

    async function danmu(url) {
        var r = await fetch(url)
        r = await r.json()
        var fin = []
        r.data.forEach((e) => {
            fin.push({
                text: e[4], // 弹幕文本
                time: parseFloat(e[0]), // 发送时间，单位秒
                color: e[2], // 弹幕局部颜色
                border: false, // 是否显示描边
                mode: 0,// 弹幕模式: 0表示滚动, 1静止
            })
        })
        return fin
    }

    useEffect(() => {
        var id = new URL(ws.setting.url).searchParams.get("UniqueId")
        if (id == null) { var id = "0000000" }

        const player = new Artplayer({
            container: artRef.current,
            url: ws.setting.url,
            id: id,
            autoSize: true,
            playbackRate: ws.role == "Master",
            setting: true,
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
            },],
            plugins: [artplayerPluginDanmuku({
                danmuku: () => { return danmu(`https://api.phantom-sea-limited.ltd/player/dmku/?ac=dm&id=${id}`) },
                speed: 5, // 弹幕持续时间，单位秒，范围在[1 ~ 10]
                opacity: 1, // 弹幕透明度，范围在[0 ~ 1]
                fontSize: 25, // 字体大小，支持数字和百分比
                color: '#FFFFFF', // 默认字体颜色
                mode: 0, // 默认模式，0-滚动，1-静止
                margin: [10, '25%'], // 弹幕上下边距，支持数字和百分比
                antiOverlap: true, // 是否防重叠
                useWorker: true, // 是否使用 web worker
                synchronousPlayback: false, // 是否同步到播放速度
                filter: (danmu) => danmu.text.length < 50, // 弹幕过滤函数，返回 true 则可以发送
                lockTime: 5, // 输入框锁定时间，单位秒，范围在[1 ~ 60]
                maxLength: 100, // 输入框最大可输入的字数，范围在[0 ~ 500]
                minWidth: 200, // 输入框最小宽度，范围在[0 ~ 500]，填 0 则为无限制
                maxWidth: 600, // 输入框最大宽度，范围在[0 ~ Infinity]，填 0 则为 100% 宽度
                theme: 'light', // 输入框自定义挂载时的主题色，默认为 dark，可以选填亮色 light
                heatmap: false, // 是否开启弹幕热度图, 默认为 false
                // beforeEmit: (danmu) => !!danmu.text.trim(), // 发送弹幕前的自定义校验，返回 true 则可以发送
                // 通过 mount 选项可以自定义输入框挂载的位置，默认挂载于播放器底部，仅在当宽度小于最小值时生效
                // mount: document.querySelector('.artplayer-danmuku'),
            }),],
            // subtitle: {
            //     url: ws.setting.subtitles
            // }
        });
        if (ws.setting.subtitles) {
            player.subtitle.url = ws.setting.subtitles
        }

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
        } else {
            const update = () => { ws.update(player) }
            player.on("video:timeupdate", update)
            player.on("video:ratechange", update)
            player.on("video:seeking", update)
            player.on("pause", update)
            player.on("play", update)
        }
        ws.install(player)
        player._danmu = (danmu) => {
            player.plugins.artplayerPluginDanmuku.emit({
                text: danmu.text,
                color: danmu.color,
                border: false,
            });
        }
        player.on('artplayerPluginDanmuku:emit', (danmu) => {
            console.info('新增弹幕', danmu);
            ws.danmu(danmu)
        });
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
