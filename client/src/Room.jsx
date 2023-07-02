import React, { useState } from 'react';
import FastRooms from './FastRooms';

function Room({ ws, Rooms }) {
    const [RoomID, setRoomID] = useState(null)
    const [RoomKey, setRoomKey] = useState("")


    return (
        <div>
            <div class="mdui-row-xs-2">
                <div class="mdui-textfield mdui-textfield-floating-label mdui-col">
                    <i class="mdui-icon material-icons">airplay</i>
                    <label class="mdui-textfield-label">房间号(可为空)</label>
                    <input class="mdui-textfield-input" type="text" onChange={(event) => { setRoomID(event.target.value) }} />
                </div>
                {/* <div className="mdui-col">
                            <label class="mdui-radio">
                                <input type="radio" name="MP4" checked />
                                <i class="mdui-radio-icon"></i>
                                公开
                            </label>

                            <label class="mdui-radio">
                                <input type="radio" name="MP4" />
                                <i class="mdui-radio-icon"></i>
                                私密
                            </label>
                        </div> */}
                <div class="mdui-textfield mdui-textfield-floating-label mdui-col">
                    <i class="mdui-icon material-icons">lock</i>
                    <label class="mdui-textfield-label">房间密钥(可为空)</label>
                    <input class="mdui-textfield-input" type="text" onChange={(event) => { setRoomKey(event.target.value) }} />
                </div>
                <button class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple mdui-color-theme-accent" onClick={() => {
                    ws.room(RoomID, "public", RoomKey)
                }}>RUSH B!</button>
            </div>
            <br></br>
            {Object.keys(Rooms).length != 0
                ? <FastRooms rooms={Rooms} ws={ws} />
                : <></>
            }
        </div>
    );
}

function LeaveRoom({ ws, setWs, setInRoom }) {
    return (
        <button class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple mdui-color-theme-accent" onClick={() => {
            ws.renew()
            setWs(ws)
            setInRoom(false)
        }}>润润润!(离开房间)</button>
    )

}

export { Room, LeaveRoom }