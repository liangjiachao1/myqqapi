const db=require('../db/index');
// 导入对密码进行加密的包
const bcrypt=require('bcryptjs')

// 修改名字
exports.updateName=(req,res)=>{
  const sqlstr='update user_userinfo set username=? where id=?'
  db.query(sqlstr,[req.body.username,req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('修改名字失败！')
    return res.cc('修改名字成功！',0)
  })
}

// 修改头像
exports.updateAvatar=(req,res)=>{
  const sqlstr='update user_userinfo set avatar=? where id=?'
  db.query(sqlstr,[req.body.avatar,req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('修改头像失败！')
    return res.cc('修改头像成功！',0)
  })
}

// 修改个性签名
exports.updatesignature=(req,res)=>{
  const sqlstr='update user_userinfo set signature=? where id=?'
  db.query(sqlstr,[req.body.signature,req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('修改签名失败！')
    return res.cc('修改签名成功！',0)
  })
}

// 修改密码
exports.updatepassword=(req,res)=>{
  if(req.body.newPwd===req.body.oldPwd) return res.cc('新旧密码不能相同！')
  const sqlstr1='select password from user_userinfo where id=?'
  db.query(sqlstr1,[req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.length!==1) return res.cc('修改密码失败！')
    const compareResult=bcrypt.compareSync(req.body.oldPwd,results[0].password)
    if(!compareResult) return res.cc('原密码错误！')
    const newPwd=bcrypt.hashSync(req.body.newPwd,10)
    const sqlstr='update user_userinfo set password=? where id=?'
    db.query(sqlstr,[newPwd,req.user.id],(err,results)=>{
      if(err) return res.cc(err)
      if(results.affectedRows!==1) return res.cc('修改密码失败！')
      return res.cc('修改密码成功！',0)
    })
  })
 
}