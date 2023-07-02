import mdui from 'mdui';
import React, { useEffect } from 'react';

const RoomSelector = ({ rooms, ws }) => {
    const renderRoomOptions = () => {
        return Object.keys(rooms).map((roomId) => (
            <option value={roomId}>Room {roomId}</option>
        ));
    };

    const handleButtonClick = () => {
        const select = document.getElementById('roomSelect');
        const roomId = select.value;
        const roomKey = rooms[roomId];

        if (roomKey) {
            ws.room(roomId, "public", roomKey)
            // ws.auto(ws)
        }
    };

    const clear = () => {
        localStorage.setItem("history", "{}")
        const rooms = {}
    }


    useEffect(() => {
        mdui.mutation();
    }, []);

    return (
        <>
            <div className="mdui-valign">
                <h1>快速连接</h1>
                <div className='mdui-col-xs-1'></div>
                <select id="roomSelect" className="mdui-select" mdui-select="">
                    {renderRoomOptions()}
                </select>
                <div className='mdui-col-xs-1'></div>
                <button className="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onClick={handleButtonClick}>
                    快速连接
                </button>
                <div className='mdui-col-xs-1'></div>
                <button className="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onClick={clear}>
                    清空历史
                </button>
            </div>
        </>
    );
};

export default RoomSelector;
