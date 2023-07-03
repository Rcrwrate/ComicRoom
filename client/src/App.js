import React, { useState, useEffect } from 'react';
import Video from './Video'
import WS from './WSClient'
import { Room, LeaveRoom } from './Room'
import { ConfigUI, Waiting } from './config';
import 'mdui/dist/css/mdui.min.css';
import 'mdui/dist/js/mdui.min.js';
import './console.css'


const App = () => {
  const [Error, setError] = useState(null)
  const [Rooms, setRooms] = useState({})
  const [ws, setWs] = useState({ 'Init': null, 'setting': null, 'roomid': null });
  const [auto, setAuto] = useState(false);

  /**
   * 用于暴力强制React刷新渲染，顺手保存一下ws
   * 
   * 之前的设计是遇到需要刷新渲染的地方就直接设置一个新的变量和控制器来刷新
   * 
   * 这点性能消耗应该不是问题(暴论)
   *
   * @param {type} ws
   * @return {null} 
   */
  const Auto = (ws) => {
    setAuto(!auto)
    setWs(ws)
  }


  useEffect(() => {
    const ws = new WS(Auto, setError)
    setWs(ws)
    setRooms(ws.history)
    return () => { ws.ws.close() }
  }, [])



  return (
    <div>
      <h1 className='title mdui-text-color-theme'>放映厅  {ws.roomid}</h1>
      {auto ? <></> : <></>}
      {ws.Init ? <></> : <Room ws={ws} Rooms={Rooms} />}
      {ws.setting != null ? <Video ws={ws} /> : <></>}
      {ws.role == "Master" ? <ConfigUI ws={ws} Auto={Auto} /> : <></>}
      {ws.role == "User" && ws.setting == null ? <Waiting /> : <></>}
      {Error
        ? <>
          <br></br>
          <div class="mdui-text-center mdui-m-b-4">
            <span class="console-error" style={{ fontSize: 48 }}>{Error}</span>
          </div>
        </>
        : <></>
      }
      {ws.Init ? <LeaveRoom ws={ws} Auto={Auto} /> : <></>}
    </div>
  );
};

export default App;
