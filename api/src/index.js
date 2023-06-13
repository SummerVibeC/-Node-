const http = require('http')
const server = http.createServer()
const { Server, WebSocket } = require('ws')
const { createUrl, genParams } = require('./utils')
const wss = new Server({ server })

server.listen(3000, () => {
  console.log('启动 http://localhost:3000')
})
// 监听客户端连接
wss.on('connection', (client) => {
  console.log('有客户端连接成功了。。。')

  // 监听客户端发送的消息
  client.on('message', (msg) => {
    // 创建星火url
    const url = createUrl()
    // 连接星火WebSocket接口
    const webSocket = new WebSocket(url)

    webSocket.on('open', () => {
      // 收到客户端发送信息，生成星火参数
      const params = genParams(msg.toString())
      // 发送信息到星火
      webSocket.send(JSON.stringify(params))
    })

    // 监听星火接口返回数据
    webSocket.on('message', (res) => {
      const data = JSON.parse(res.toString())
      const code = data['header']['code']
      if (code !== 0) {
        client.send(
          JSON.stringify({
            code: 500,
            msg: '服务器错误',
          })
        )
      } else {
        const choices = data['payload']['choices']
        const status = choices['status']
        const content = choices['text'][0]['content']
        client.send(
          JSON.stringify({
            code: 200,
            content,
            status,
          })
        )
        if (status === 2) {
          webSocket.close()
        }
      }
    })
  })
})
