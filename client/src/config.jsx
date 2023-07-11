import mdui from 'mdui';
import React, { useEffect, useState } from 'react';

function ConfigUI({ ws, Auto }) {
    const [url, seturl] = useState(null)
    const [Sync, setSync] = useState(5)
    const [Max, setMax] = useState(15)
    const [DP, setDP] = useState(false)

    function isURLValid(url) {
        try {
            const urlObject = new URL(url);
            return urlObject.href === urlObject.href;
        } catch (err) {
            return false;
        }
    }

    function push_config() {
        if (!isURLValid(url)) {
            ws.showError("视频地址异常")
        } else {
            ws.showError(null)
            var player
            if (DP) { player = "DP" } else { player = "AP" }
            ws.config(url, Sync, Max, player)
            Auto(ws)
        }
    }



    useEffect(() => {
        var setting = localStorage.getItem("setting")
        var u = mdui.$("#token")[0]
        var s = mdui.$("#syncTime")[0]
        var m = mdui.$("#maxTime")[0]
        if (setting != null && setting != "null") {
            setting = JSON.parse(setting)
            seturl(setting.url)
            setMax(setting.maxTime)
            setSync(setting.syncTime)
            setDP(setting.player == "DP")
            u.value = setting.url
            s.value = setting.syncTime
            m.value = setting.maxTime
        } else {
            s.value = Sync
            m.value = Max
        }
        mdui.mutation();
        mdui.updateSliders()
    }, []);

    return (
        <div className="mdui-panel mdui-panel-popout" mdui-panel="">
            <div className="mdui-panel-item">
                <div className="mdui-panel-item-header">
                    <div className="mdui-panel-item-title">视频设置</div>
                    {/* <div className="mdui-panel-item-summary">Carribean cruise</div> */}
                    <i className="mdui-panel-item-arrow mdui-icon material-icons">
                        keyboard_arrow_down
                    </i>
                </div>
                <div className="mdui-panel-item-body">
                    <form>
                        <div className="mdui-textfield mdui-textfield-floating-label">
                            <i className="mdui-icon material-icons">lock</i>
                            <label className="mdui-textfield-label">视频地址</label>
                            <input
                                className="mdui-textfield-input"
                                type="text"
                                name="token"
                                id="token"
                                onChange={(e) => { seturl(e.target.value) }}
                                required
                            />
                        </div>
                        <br />
                        <div class="mdui-row-md-4">
                            <div class="mdui-col">
                                <label class="mdui-radio">
                                    {DP ? <input type="radio" name="group1" checked onChange={(e) => { setDP(true) }} /> : <input type="radio" name="group1" onChange={(e) => { setDP(true) }} />}
                                    <i class="mdui-radio-icon"></i>
                                    Dplayer
                                </label>
                            </div>
                            <div class="mdui-col">
                                <label class="mdui-radio">
                                    {!DP ? <input type="radio" name="group1" checked onChange={(e) => { setDP(false) }} /> : <input type="radio" name="group1" onChange={(e) => { setDP(false) }} />}
                                    <i class="mdui-radio-icon"></i>
                                    ArtPlayer
                                </label>
                            </div>
                        </div>
                    </form>
                    <div className="mdui-panel-item-actions">
                        <button className="mdui-btn mdui-ripple" mdui-panel-item-close="">
                            cancel
                        </button>
                        <button className="mdui-btn mdui-ripple" onClick={push_config}>save</button>
                    </div>
                </div>
            </div>
            <div className="mdui-panel-item">
                <div className="mdui-panel-item-header">
                    <div className="mdui-panel-item-title">房间设置</div>
                    <i className="mdui-panel-item-arrow mdui-icon material-icons">
                        keyboard_arrow_down
                    </i>
                </div>
                <div className="mdui-panel-item-body">
                    <p>同步时间间隔</p>
                    <label class="mdui-slider mdui-slider-discrete">
                        <input type="range" step="1" min="1" max="60" id='syncTime' onChange={(e) => { setSync(e.target.value) }} />
                    </label>
                    <p>最大时间差</p>
                    <label class="mdui-slider mdui-slider-discrete">
                        <input type="range" step="1" min="5" max="30" id='maxTime' onChange={(e) => { setMax(e.target.value) }} />
                    </label>
                    <div className="mdui-panel-item-actions">
                        <button className="mdui-btn mdui-ripple" mdui-panel-item-close="">
                            cancel
                        </button>
                        <button className="mdui-btn mdui-ripple" onClick={push_config}>save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Waiting() {
    return (
        <>
            <div class="mdui-text-center mdui-m-b-4">
                <span class="console-error" style={{ fontSize: 48 }}>正在等待房主</span>
            </div>
            <div class="mdui-progress">
                <div class="mdui-progress-indeterminate"></div>
            </div>
        </>

    )
}

export { ConfigUI, Waiting }