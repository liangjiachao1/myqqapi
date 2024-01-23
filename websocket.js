var ws = require("nodejs-websocket")
// 将所有的用户都存储到此对象中
const conns={}

// 创建一个服务server,每次用户链接，函数就会被执行，并给当前用户创建一个connect对象
var server = ws.createServer(connect => {

    // 每当接收到用户传递过来的数据，就会触发text事件，并传入数据
    connect.on("text", data => {
        
        // 给用户响应数据
        // connect.sendText(data.toUpperCase()+"!!!") //转换大小写并并拼接字符串
        data=JSON.parse(data)
        let user='用户'+data.id
        let frienduser=''
        if(data.friendid) frienduser='用户'+data.friendid
        conns[user]=connect 
        // console.log(data.value,frienduser)
        // 设置一个暗语，用于用户一登录即发送给服务端，但是这个暗语不需要发送给其他人
        if(data.value==='用户加入聊天') return
        // 给指定用户发送信息
        if(conns[frienduser]) conns[frienduser].sendText(data.value)
    })

    //监听websocket断开链接
    connect.on("close", () => {
        // console.log("websocket连接断开....")
    })

    //监听websocket异常信息
    connect.on("error", () => {
        // console.log("websocket连接异常....") 
    })
})

module.exports = server