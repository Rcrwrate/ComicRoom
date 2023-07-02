# ComicRoom

放映厅

### 学习记录

顺便学习React(?)

有一说一，React有点过于神秘(确信)

具体举个例子，我还是不是很懂

这段代码用于生成Websocket客户端，ws将最为prop传递给其他的组件，然后神奇的事情出现了

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

0. 有的时候，ws自身做出的更改，会自带传递到上层组件，无需使用`setWs(ws)`

1. 而又有些时候，就必须使用`setWs(ws)`，然后更神奇的又来了，使用这个有时候会出现没反应的情况。

2. 于是，我把`setWs(ws)`嵌入到了`Auto()`中，然后把这个东西传递到`ws`构造函数，然后再去调用`ws.auto()`，实践结果是能够解决一部分的问题。

3. 那么，最好剩下的一部分如何解决？直接传递`ws`和`Auto`作为prop到下级组件，然后暴力解决问题

PS: No.1和No.2视为同一种方案，实践中只使用了No.2

最后，很神秘的时候，有些时候，No.1正常，No.2正常，No.3不正常，反之亦然，就像两个互斥的存在一样

更有甚者，二者接不需要


### 细嗦

