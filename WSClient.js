const config = {
    wsUrl: "ws://localhost:8081"
}


class WS {
    Init = null
    roomid = null
    roomkey = null

    constructor() {
        this.ws = new WebSocket(config.wsUrl)
        this.ws.addEventListener("message", this.onmessage)
        this.history = WS.localconfig("history")
        if (this.history == null) {
            this.history = {}
        }
    }

    send(msg) {
        this.ws.send(JSON.stringify(msg))
    }

    //使用箭头函数或绑定函数来确保this指向正确的对象
    onmessage = (msg) => {
        console.log(msg)
        msg = JSON.parse(msg.data)
        switch (msg.type) {
            case "init":
                this.Init = true
                if (msg.room != undefined) {
                    this.roomid = msg.room.id
                    this.roomkey = msg.room.key
                }
                break
            case "error":
                WS.showError(msg.error)
                break
        }
    }

    room(roomid, roomtype = "public", roomkey = "") {
        if (roomkey == "") {
            this.send({ "type": "init", "room": { "type": roomtype, "id": roomid } })
        } else {
            this.send({ "type": "init", "room": { "type": roomtype, "id": roomid, "key": roomkey } })
        }
        this.addhistory(roomid, roomkey)
    }

    danmu(msg) {
        if (this.Init != undefined) {
            this.send({ "type": "sync", "info": msg })
        } else {
            WS.showError("初始化未完成!")
        }
    }

    addhistory(id, key) {
        this.history[id] = key
        WS.localconfig("history", this.history)
        WS.localconfig("last", id)
    }

    static localconfig(key, msg = '') {
        if (msg === '') {
            return JSON.parse(localStorage.getItem(key));
        } else {
            return localStorage.setItem(key, JSON.stringify(msg))
        }
    }

    static showError(msg) {
        console.log(msg)
    }
}

