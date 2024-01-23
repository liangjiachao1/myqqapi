// 登录接口的处理函数
const db=require('../db/index')
// 导入对密码进行加密的包
const bcrypt=require('bcryptjs')
// 生成Token的包
const jwt=require('jsonwebtoken')
const config=require('../config')



exports.loginUser=(req,res)=>{
  const userinfo={...req.body}
  const sqlStr='select * from user_userinfo where phone=?'
  db.query(sqlStr,req.body.phone,(err,results)=>{
    if(err) return res.cc(err)
    if(results.length>1) return res.cc('登录失败！')
    // 注册
    if(results.length===0) {
      const sql='insert into user_userinfo set ?'
      userinfo.password=bcrypt.hashSync(userinfo.password,10)
      db.query(sql,{phone:userinfo.phone,password:userinfo.password},(err1,results1)=>{
        if(err1) return res.cc(err1)
        if(results1.affectedRows!==1) return res.cc('注册失败，请稍后再试！')
        // 获取新生成的数据，转化为Token
        db.query(sqlStr,req.body.phone,(err2,results2)=>{
          if(err2) return res.cc(err2)
          if(results2.length!==1) return res.cc('登录失败，请稍后再试！')
          // 生成Token
          const user={...results2[0],password:'',avatar:''}
          const tokenStr=jwt.sign(user,config.jwtSecretKey,{expiresIn:config.expiresIn})
          res.send({
            status:0,
            message:'注册并且登录成功',
            token:"Bearer "+tokenStr,
            userinfo:{
              phone:results2[0].phone,
              user_id:results2[0].id,
              username:results2[0].username,
              user_avatar:results2[0].avatar,
              user_signature:results2[0].signature,
            }
          })
        })
      })
    }
    // 登录
    if(results.length===1) {
      const compareResult=bcrypt.compareSync(userinfo.password,results[0].password)
      if(!compareResult) return res.cc('密码错误！')
      const user={...results[0],password:'',avatar:''}
      const tokenStr="Bearer "+jwt.sign(user,config.jwtSecretKey,{expiresIn:config.expiresIn})
      const sqlstr3='update user_userinfo set online=1 where id=?'
      db.query(sqlstr3,results[0].id,(err3,results3)=>{
        if(err3) return res.cc(err3)
        if(results3.affectedRows!==1) return res.cc('登录失败，请稍后再试！')
        res.send({
          status:0,
          message:'登录成功',
          token:tokenStr,
          userinfo:{
            phone:results[0].phone,
            user_id:results[0].id,
            username:results[0].username,
            user_avatar:results[0].avatar,
            user_signature:results[0].signature,
          }
        })
      })
    }
  })
}

