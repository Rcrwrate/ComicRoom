const config = {
    wsUrl: "ws://localhost:8080"
}


class WS {
    Init = null
    roomid = null
    roomkey = null
    role = null

    constructor(initcallback = (e) => { }, failcallback = (e) => { }) {
        this.ws = new WebSocket(config.wsUrl)
        this.ws.addEventListener("message", this.onmessage)
        this.history = WS.localconfig("history")
        if (this.history == null) {
            this.history = {}
        }
        this.initcallback = initcallback
        this.failcallback = failcallback
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
                    this.role = msg.room.role
                    if (msg.room.key != undefined) { this.addhistory(msg.room.id, msg.room.key) }
                }
                this.initcallback(this)
                break
            case "error":
                this.showError(msg.error)
                break
            default:
                break
        }
    }

    room(roomid, roomtype = "public", roomkey = "") {
        if (roomid == null) {
            roomid = WS.getRandomString(6)
        }
        if (roomkey == "") {
            this.send({ "type": "init", "room": { "type": roomtype, "id": roomid } })
        } else {
            this.send({ "type": "init", "room": { "type": roomtype, "id": roomid, "key": roomkey } })
        }
    }

    danmu(msg) {
        if (this.Init != undefined) {
            this.send({ "type": "sync", "info": msg })
        } else {
            this.showError("初始化未完成!")
        }
    }

    addhistory(id, key) {
        this.history[id] = key
        WS.localconfig("history", this.history)
    }

    static localconfig(key, msg = '') {
        if (msg === '') {
            return JSON.parse(localStorage.getItem(key));
        } else {
            return localStorage.setItem(key, JSON.stringify(msg))
        }
    }

    showError(msg) {
        console.log(msg)
        this.failcallback(msg)
    }

    renew() {
        this.Init = null
        this.roomid = null
        this.roomkey = null
        this.role = null
        this.ws.close()
        this.ws = new WebSocket(config.wsUrl)
        this.ws.addEventListener("message", this.onmessage)
    }

    static getRandomString(len) {
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
}


export default WS