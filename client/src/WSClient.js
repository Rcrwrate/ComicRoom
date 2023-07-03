const config = {
    wsUrl: "wss://124.222.180.82/comic"
}


class WS {
    Init = null
    roomid = null
    roomkey = null
    role = null
    setting = null

    constructor(auto = (e) => { }, error = (e) => { }) {
        this.init()
        this.history = WS.localconfig("history")
        if (this.history == null) {
            this.history = {}
        }
        this.auto = auto
        this.error = error
    }

    init() {
        this.ws = new WebSocket(config.wsUrl)
        this.ws.onmessage = this.onmessage
        this.ws.onclose = this.onclose
    }

    send(msg) {
        try {
            this.ws.send(JSON.stringify(msg))
            this.showError(null)
        } catch (e) {
            if (e.message == "Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.") {
                this.showError("你先别急，连接尚未建立")
            }
            console.log(e.message)
        }
    }

    onclose = (e) => {
        this.init()
        if (this.roomid != null) {
            setTimeout(() => { this.room(this.roomid, "public", this.roomkey) }, 1000)
        }
        this.auto(this)
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
                setTimeout(() => { this.fetch() }, 1000)
                this.auto(this)
                break
            case "fetch":
                this.setting = msg.config
                this.auto(this)
            case "error":
                this.showError(msg.error)
                break
            case "sync":
                this.sync(msg)
                break
            default:
                break
        }
    }

    config(url, syncTime, maxTime) {
        this.setting = { "url": url, "syncTime": syncTime, "maxTime": maxTime }
        WS.localconfig("setting", this.setting)
        this.send({ "type": "push", "config": this.setting })
        this.auto(this)
    }

    fetch() {
        if (this.Init == true) {
            if (this.role != "Master" && this.setting == null) {
                this.send({ "type": "fetch" })
                setTimeout(() => { this.fetch() }, 1000)
            }
        } else {
            setTimeout(() => { this.fetch() }, 1000)
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

    install(player) {
        this.player = player
    }
    sync(msg) {
        if (this.player != undefined) {
            switch (msg.info) {
                case "update":
                    var T = msg.data.time + (new Date().valueOf() - msg.data.now) / 1000 - this.player.video.currentTime
                    console.log(T)
                    if (msg.data.paused != this.player.paused && this.fixing == undefined) { this.player._toggle() }
                    if (this.fixing && (T < this.setting.syncTime || T > -this.setting.syncTime)) { this.fixing = undefined; this.player._play() }
                    if (msg.data.speed != this.player.video.playbackRate) { this.player._speed(msg.data.speed) }
                    if ((T > this.setting.maxTime || T < -this.setting.maxTime) && this.player.video.networkState == 1) {
                        this.player._seek(T + this.player.video.currentTime + this.setting.maxTime)
                        this.player._pause()
                        this.player.notice("播放误差时间超过了最大允许时间,正在对轴")
                        this.fixing = true
                    }
            }
        }
    }

    update(player) {
        this.send({
            "type": "sync", "info": "update", "data": { "time": player.video.currentTime, "now": new Date().valueOf(), "paused": player.paused, "ended": player.video.ended, "speed": player.video.playbackRate }
        })
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
        if (msg != null) { console.log(msg) }
        this.error(msg)
    }

    renew() {
        this.Init = null
        this.roomid = null
        this.roomkey = null
        this.role = null
        this.setting = null
        this.ws.onclose = null
        this.ws.close()
        this.init()
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