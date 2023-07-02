import React, { useState, useEffect } from 'react';
import Video from './Video'
import WS from './WSClient'
import { Room, LeaveRoom } from './Room'
import { ConfigUI, Waiting } from './config';
import 'mdui/dist/css/mdui.min.css';
import 'mdui/dist/js/mdui.min.js';
import './console.css'


const App = () => {
  const [InRoom, setInRoom] = useState(false)
  const [Error, setError] = useState(null)
  const [Rooms, setRooms] = useState({})
  const [ws, setWs] = useState({ 'init': null });


  useEffect(() => {
    const ws = new WS(
      (ws) => { console.log(ws); setInRoom(true); setError(null) },
      (msg) => { setError(msg) }
    )
    setWs(ws)
    setRooms(ws.history)
    return () => { ws.ws.close() }
  }, [])



  return (
    <div>
      <h1 className='title mdui-text-color-theme'>放映厅  {ws.roomid}</h1>
      {InRoom ? <></> : <Room ws={ws} Rooms={Rooms} />}
      {ws.role == "Master" ? <ConfigUI /> : <></>}
      {ws.role == "User" ? <Waiting /> : <></>}
      {Error
        ? <>
          <br></br>
          <div class="mdui-text-center mdui-m-b-4">
            <span class="console-error" style={{ fontSize: 48 }}>{Error}</span>
          </div>
        </>
        : <></>
      }
      {InRoom ? <LeaveRoom ws={ws} setWs={setWs} setInRoom={setInRoom} /> : <></>}
    </div>
  );
};

export default App;
