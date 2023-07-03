const WebSocketServer = require("ws").Server

const wss = new WebSocketServer({ port: 8080 })

var rooms = {}
var clients = {}

wss.on("connection", function (ws, msg) {
    // console.log(ws)
    // console.debug(`[Connection]:\t`)
    // console.debug(msg)

    var WSID
    try {
        WSID = ws.headers["sec-websocket-key"]
    } catch (e) {
        try {
            WSID = ws.upgradeReq.rawHeaders[ws.upgradeReq.rawHeaders.indexOf("Sec-WebSocket-Key") + 1]
        } catch (e) { WSID = getRandomString(10) }
    }

    console.log(`[Opened ${WSID}]\t`)
    var role = "User"
    var ID
    var init = false
    var send = function (msg) {
        console.log(`[Send ${WSID}]:\t${msg}`)
        ws.send(msg)
    }
    ws.on("message", function (data, isBinary) {
        msg = data.toString()
        console.log(`[Recv ${WSID}]:\t${msg}`)
        try {
            msg = JSON.parse(msg)
            switch (msg.type) {
                case "init":
                    if (init) {
                        send(JSON.stringify({ "type": "error", "error": "reinit is not allow!" }))
                        break
                    }
                    init = true
                    ID = msg.room.id    //  Get ID
                    clients[WSID] = send    //  Set function
                    if (rooms[msg.room.id] == undefined || ((new Date().valueOf() - rooms[msg.room.id].expire) > 3600 * 1000)) {  //  init
                        role = "Master"
                        var key = getRandomString(10)
                        msg.room.key = key
                        msg.room.role = role
                        send(JSON.stringify(msg))
                        rooms[msg.room.id] = msg.room
                        rooms[msg.room.id].Master = WSID
                        rooms[msg.room.id].User = []
                        rooms[msg.room.id].expire = new Date().valueOf()
                    } else if (msg.room.key == undefined && role == "User") {   //    Join Room
                        rooms[msg.room.id].User.push(WSID)
                        msg.room.role = role
                        send(JSON.stringify(msg))
                    } else if (rooms[msg.room.id].key == msg.room.key) {    //  Reconnect init
                        role = "Master"
                        msg.room.role = role
                        rooms[msg.room.id].Master = WSID
                        send(JSON.stringify(msg))
                    } else {                        //  faild Reconnect init
                        init = false
                        send(JSON.stringify({ "type": "error", "error": "The room key is incorrect" }))
                    }
                    break
                case "sync":
                    msg = JSON.stringify(msg)
                    if (role == "User") {
                        try { clients[rooms[ID].Master](msg) } catch { }
                        rooms[ID].User.forEach(client => {
                            if (client != WSID) {
                                clients[client](msg)
                            }
                        })
                    } else {
                        rooms[ID].User.forEach(client => {
                            clients[client](msg)
                        })
                    }
                    break
                case "fetch":
                    if (rooms[ID].config != undefined) {
                        send(JSON.stringify({ "type": "fetch", "config": rooms[ID].config }))
                    }
                case "push":
                    if (role == "Master") {
                        rooms[ID].config = msg.config
                        msg = JSON.stringify({ "type": "fetch", "config": rooms[ID].config })
                        rooms[ID].User.forEach(client => {
                            if (client != WSID) {
                                clients[client](msg)
                            }
                        })
                    }
                    break
                case "debug":
                    console.log(rooms)
                    console.log(clients)
                    send("{}")
                    break
                default:
                    send(JSON.stringify({ "type": "error", "error": "msg type not support!" }))
            }
        } catch (e) {
            console.error(e)
            send(JSON.stringify({ "type": "error", "error": "server failed" }))
        }
    })
    ws.on("close", function () {
        if (init) {
            if (role == "User") {
                rooms[ID].User.forEach(function (item, index, arr) {
                    if (item == WSID) {
                        arr.splice(index, 1);
                    }
                });
            } else {
                rooms[ID].Master = undefined
            }
            delete clients[WSID]
        }
        console.log(`[Closed ${WSID}]`)
    })
    ws.on("error", function (e) {
        console.error(e)
        ws.send(JSON.stringify({ "type": "error", "error": "server failed" }))
    })
})
wss.on("error", (e) => {
    console.error(e)
    wss.send(JSON.stringify({ "type": "error", "error": "server failed" }))
})
wss.on("listening", () => { console.log("[Sys]:\t Server started!") })


function getRandomString(len) {
    //  https://blog.csdn.net/jiciqiang/article/details/121915750
    let _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
        min = 0,
        max = _charStr.length - 1,
        _str = '';                    //定义随机字符串 变量
    //判断是否指定长度，否则默认长度为15
    len = len || 15;
    //循环生成字符串
    for (var i = 0, index; i < len; i++) {
        index = (function (randomIndexFunc, i) {
            return randomIndexFunc(min, max, i, randomIndexFunc);
        })(function (min, max, i, _self) {
            let indexTemp = Math.floor(Math.random() * (max - min + 1) + min),
                numStart = _charStr.length - 10;
            if (i == 0 && indexTemp >= numStart) {
                indexTemp = _self(min, max, i, _self);
            }
            return indexTemp;
        }, i);
        _str += _charStr[index];
    }
    return _str;
}