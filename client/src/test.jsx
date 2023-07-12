import ASS from 'assjs'
import DPlayer from 'dplayer';
import React, { useEffect, useRef } from 'react';

export default function TestASS() {
  const playerRef = useRef(null);

  var id_list = {
    "1": {
      "video": "01T4VX662V4D5ZT5VTEBAYFVYWJIOSYHAZ",
      "ass": "01T4VX666WLEBX7CKUTNFJKTV7SAFRGK4H"
    },
  }
  var r = {}
  var BASE = "https://api.sirin.top/release/API/get?api&id="
  function get_url(wait_dist) {
    var vid = wait_dist.video
    var aid = wait_dist.ass
    HTTP(BASE + vid, "vid")
    HTTP(BASE + aid, "aid")
    HTTP(BASE + vid + "&thumbnails", "pic")
  }
  function HTTP(url, name) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        r[name] = eval('(' + xhr.responseText + ')');
        try_on()
      }
    }
    xhr.open('GET', url, true);
    xhr.send();
  }
  function try_on() {
    try {
      DP(r.vid['@microsoft.graph.downloadUrl'], r.pic["thumbnail"], r.aid['@microsoft.graph.downloadUrl'])
    } catch (err) { }
  }
  function DP(url, Pic, ass_file) {
    if (!(url && Pic && ass_file)) { return }
    window.__DATA__ = {
      video: url,
      pic: Pic,
      subtitle: {
        url: ass_file,
        type: 'ass'
      }
    };

    window.__INIT__ = {};


    window.__INIT__.dPlayer = new DPlayer({
      container: playerRef.current,
      screenshot: true,
      theme: '#66CCFF',
      playbackSpeed: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      subtitle: window.__DATA__.subtitle,
      video: {
        url: window.__DATA__.video,
        pic: window.__DATA__.pic,
      }
    });

    window.__INIT__.dPlayer.on('subtitle_show', function () {
      window.__INIT__.dPlayer.notice("显示字幕", 2000);
      console.log('subtitle_show');
      if (window.__INIT__.ass !== undefined) {
        window.__INIT__.ass.show();
      }
    });
    window.__INIT__.dPlayer.on('subtitle_hide', function () {
      window.__INIT__.dPlayer.notice("隐藏字幕", 2000);
      if (window.__INIT__.ass !== undefined) {
        window.__INIT__.ass.hide();
      }
    });

    window.__INIT__.dPlayer.on('resize', function () {
      console.log("Resized!")
      if (window.__INIT__.ass !== undefined) {
        document.getElementsByClassName('ASS-container')[0].style.width = '';
        document.getElementsByClassName('ASS-container')[0].style.height = '';
        window.__INIT__.ass.resize();
        var t = document.getElementsByClassName("ASS-stage")
        window.__INIT__.dPlayer.video.parentElement.style.height = t[t.length - 1].style.height
      }
    });
    window.onresize = function () {
      // 确保网页全屏时改动浏览器窗口大小，视频大小也跟随变化。
      // TODO: 应该加个判断：dPlayer的fullScreen状态为
      window.__INIT__.dPlayer.resize();
    };

    window.__INIT__.dPlayer.on('subtitle_change', function () {
      if (window.__INIT__.dPlayer !== undefined && window.__INIT__.dPlayer.subtitle.options.type === 'ass') {
        fetch(window.__INIT__.dPlayer.subtitle.options.url).then((r) => {
          r.text().then(function (response) {
            if (window.__INIT__.ass !== undefined) {
              window.__INIT__.ass.destroy();
            }
            window.__INIT__.ass = new ASS(response, window.__INIT__.dPlayer.video, {
              container: window.__INIT__.dPlayer.container.getElementsByClassName('dplayer-video-wrap')[0],
            });
          }).catch(function (error) {
            window.__INIT__.dPlayer.notice("外挂字幕加载失败: " + error, 6000);
          });
        })
      }
    });
    window.__INIT__.dPlayer.events.trigger('subtitle_change');
    setTimeout(fix, 3000)
  };
  function fix() {
    window.__INIT__.dPlayer.fullScreen.request('web');
    window.__INIT__.dPlayer.fullScreen.cancel('web');
  }

  useEffect(() => { get_url(id_list["1"]) }, [])

  return <div ref={playerRef} />;
}