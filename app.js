const express=require('express')
const bodyParser=require('body-parser')
// const formidable=require('express-formidable')
const app=express()


// 允许跨域的中间件
const cors=require('cors')
app.use(cors())

app.use(express.urlencoded({extended:false}))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use(bodyParser.text())

// app.use(formidable())

// 封装失败情况下的函数
app.use((req,res,next)=>{
  // status=1表示失败的情况
  res.cc=function(err,status=1){
    res.send({
      status,
      message:err instanceof Error?err.message:err
    })
  }
  next()
})

// 解析Token的中间件
const expressJWT=require('express-jwt')
const config=require('./config.js')

app.use(expressJWT({secret:config.jwtSecretKey}).unless({path:[/^\/api\//]}))

// 导入用户登录路由模块
const userLoginRouter=require('./router/user')
app.use('/api',userLoginRouter)
// 导入用户聊天模块
const userChatRouter=require('./router/userChat')
app.use('/user/chat',userChatRouter)
// 导入获取用户信息模块
const userInfoRouter=require('./router/userinfo.js')
app.use('/userinfo',userInfoRouter)
// 导入好友申请模块
const FriendRouter=require('./router/friend.js')
app.use('/friend',FriendRouter)
// 导入修改信息模块
const updateInfoRouter=require('./router/updateinfo.js')
app.use('/updateinfo',updateInfoRouter)

// 定义错误级别的中间件
app.use((err,req,res,next)=>{
  // 身份认证失败后的错误
  if(err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  res.cc(err)
})

app.get('/cs',(req,res)=>{
  res.cc('cg',0)
})

const ws=require('./websocket')
ws.listen(8001, () => {
  console.log("websocket running")
})

app.listen(8080,()=>{
  console.log('http://127.0.0.1:8080')
})