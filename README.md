# ComicRoom

放映厅

## TO DO

- [ ] 在房间内换视频以及播放器类型只有房主会换，其他的得重新进

- [ ] 字幕

- [ ] DPlayer弹幕

- [x] Artplayer弹幕

- [x] 支持多种播放器

- [x] 在房主拖时间轴的时候，用户端会出现时间乱跳的情况

- [x] WS断线重连

### 学习记录

顺便学习React(?)

有一说一，React有点过于神秘(确信)

具体举个例子，我还是不是很懂

这段代码用于生成Websocket客户端，ws将作为prop传递给其他的组件，然后神奇的事情出现了

```jsx
import WS from './WSClient'
...
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
...
useEffect(() => {
    const ws = new WS(Auto, setError)
    setWs(ws)
    setRooms(ws.history)
    return () => { ws.ws.close() }
  }, [])
```

0. 有的时候，ws自身做出的更改，会自动传递到上层组件，无需使用`setWs(ws)`

1. 而又有些时候，就必须使用`setWs(ws)`，然后更神奇的又来了，使用这个有时候会出现没反应的情况。

2. 于是，我把`setWs(ws)`嵌入到了`Auto()`中，然后把这个东西传递到`ws`构造函数，然后再去调用`ws.auto()`，实践结果是能够解决一部分的问题。

3. 那么，最好剩下的一部分如何解决？直接传递`ws`和`Auto`作为prop到下级组件，然后暴力解决问题

PS: No.1和No.2视为同一种方案，实践中只使用了No.2

最后，很神秘的时候，有些时候，No.1正常，No.2正常，No.3不正常，反之亦然，就像两个互斥的存在一样

更有甚者，二者接不需要


### 二番细嗦

我在翻了一遍文档之后，发现了真相(**总结：切忌不看文档就上手!**)

>  [将 state 视为只读的](https://zh-hans.react.dev/learn/updating-objects-in-state#treat-state-as-read-only)
>
>   换句话说，你应该 **把所有存放在 state 中的 JavaScript 对象都视为只读的。**
>
>   为了真正地 **触发一次重新渲染，你需要创建一个新对象并把它传递给 state 的设置函数**
>
>   摘要：
>   - 将 React 中所有的 state 都视为不可直接修改的。
>   - 当你在 state 中存放对象时，直接修改对象并不会触发重渲染，并会改变前一次渲染“快照”中 state 的值。
>   - 不要直接修改一个对象，而要为它创建一个 **新** 版本，并通过把 state 设置成这个新版本来触发重新渲染。
>   - 你可以使用这样的 `{...obj, something: 'newValue'}` 对象展开语法来创建对象的拷贝。
>   - 对象的展开语法是浅层的：它的复制深度只有一层。
>   - 想要更新嵌套对象，你需要从你更新的位置开始自底向上为每一层都创建新的拷贝。
>   - 想要减少重复的拷贝代码，可以使用 Immer。

但是还有个问题，Websocket导致代码无法做成同步的逻辑，像这般，但这里的代码实际上并没有对state做出修改，在这里保存没有意义

```js
ws.auto(draft => {
  draft.room(RoomID, "public", RoomKey)
})
```
然而，这并没有什么作用，真正需要触发保存的地方在于发送消息之后收到消息的时候
```js
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
          // this.auto(this)
          break
```
在这个时候，我很难去做到去不修改state

最后的思路就是，我强行不更改原来的变量，给`WS`强行设计一个copy()函数复制它本身，然后把它进行操作，再传递给`Auto`，这样原来的state没除了ws连接外变量没有改变。

还有一个歪理：
```js
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
```
使用暴力`sleep(1000)`去强行等待初始化完成