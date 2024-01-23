const db= require('../db/index')

// 发送好友申请
exports.sendFriendApplication=(req,res)=>{
  const sqlstr2='select * from user_friends where userSender=? and userRecipients=? and application <> 0'
  db.query(sqlstr2,[req.user.id,req.body.userRecipients],(err1,results1)=>{
    if(err1) return res.cc(err1)
    if(results1.length>0 && results1[0].application===2) return res.cc('已发送过好友申请')
    if(results1.length>0 && results1[0].application===1) return res.cc('你们已经是好友了')
    const sqlstr='insert into user_friends (userSender,userRecipients,classid) values (?,?,?)'
    db.query(sqlstr,[req.user.id,req.body.userRecipients,req.body.classid],(err,results)=>{
      if(err) return res.cc(err)
      if(results.affectedRows!==1) return res.cc('发送好友申请失败')
      res.cc('已发送好友申请',0)
    })
  })

}

// 获取好友申请的接口
exports.getFriendApplication=(req,res)=>{
  const sqlstr="select * from user_friends where userRecipients=? and application=2 order by id desc"
  db.query(sqlstr,[req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.length<=0) return res.cc('没有好友申请',0)
    results.forEach((item,index)=>{
      const sqlstr2='select id,username,avatar,phone,signature from user_userinfo where id=?'
      db.query(sqlstr2,[item.userSender],(err2,results2)=>{
        if(err2) return res.cc(err2)
        results[index].userSender={}
        results[index].userSender=results2[0]
        if(index===results.length-1) {
          res.send({
            status:0,
            message:'获取好友申请成功',
            data:results
          })
        }
      })
    })

  })
}

// 处理好友申请接口
exports.handleFriendApplication=(req,res)=>{
  const sqlstr1='update user_friends set application=? where id=?'
  db.query(sqlstr1,[req.body.application,req.body.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('处理好友申请失败,请稍后再试')
    if(req.body.application===1){
      const sqlstr2='update user_friends set recipientsclassid=? where id=?'
      db.query(sqlstr2,[req.body.recipientsclassid,req.body.id],(err2,results2)=>{
        if(err2) return res.cc(err2)
        if(results2.affectedRows!==1) return res.cc('处理好友申请失败,请稍后再试')
        res.cc('已同意好友申请')
      })
    }else{res.cc('已拒绝好友申请',0)}

    
  })
}

// 搜索功能
exports.searchUser=(req,res)=>{
  const sqlstr1='select id,username,avatar,phone from user_userinfo where username like ? or phone like ?'
  db.query(sqlstr1,[`%${req.query.keywords}%`,`%${req.query.keywords}%`],(err,results)=>{
    if(err) return res.cc(err)
    if(results.length<=0) return res.cc('没有找到相关用户',0)
    results=results.slice(0,9)
    res.send({
      status:0,
      message:'搜索成功',
      data:results
    })
  })
}