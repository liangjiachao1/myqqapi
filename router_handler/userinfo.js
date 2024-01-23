const db=require('../db/index')

// 获取用户详情的处理函数
exports.getfriendsUserinfo=(req,res)=>{
  const sql = 'select username,avatar,id,signature,phone from user_userinfo where id=?'
  db.query(sql,[req.query.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.length===0) return res.cc('获取失败')
    // 判断两人是否为好友
    const sql='select * from user_friends where userSender=? and userRecipients=? or userSender=? and userRecipients=?'
    db.query(sql,[req.user.id,req.query.id,req.query.id,req.user.id],(err1,results1)=>{
      if(err1) return res.cc(err1)
      // 过滤掉所有application=0的情况。防止有人反复删除和添加
      results1=results1.filter(v=>v.application1!==0)
      if(results1.length>0) results[0].isFriend=results1[0].application
      if(results1.length===0) results[0].isFriend=0

      res.send({status:0,message:'获取成功',data:results[0]})
    })
    
  })
}

// 获取用户好友分类和列表详情
exports.getfriendsUserinfoList=async (req,res)=>{
  const sqlstr='select * from user_friendclass where userid=?'
  // 获取好友分类
  db.query(sqlstr,[req.user.id],async (err,results)=>{
    if(err) return res.cc(err)
    if(results.length===0) return res.cc('你尚未添加好友分类,请添加')
    let promises=[]
    // 通过分类获取好友详情
    results.forEach((item,index)=>{
      // for(let i=0;i<results.length;i++){
      // 获取每个分类里面的用户id
      promises.push(new Promise((resolve,reject)=>{
        const sqlstr2='select * from user_friends where classid=? and application=1 or recipientsclassid=? and application=1'
      db.query(sqlstr2,[item.id,item.id],(err1,results1)=>{
        if(err1) return res.cc(err1)
        // 返回需要获取的用户信息的id
        results1=results1.map(item=>{
          return item.userSender===req.user.id?item.userRecipients:item.userSender
        })
        // // 由于访问数据库是异步的，所以我们需要使用延时器进行异步
        if(results1.length===0) {
            // setTimeout(()=>{
              results[index].friendsList=[]
              // if(index===results.length-1) return res.send({status:0,message:'获取成功',data:results})
              resolve()
            // },200)
            
        }
        else {results1.forEach((item2,index2)=>{
          // 根据id获取用户信息
          const sqlstr3="select * from user_userinfo where id=?"
          db.query(sqlstr3,[item2],(err2,results2)=>{
            if(err2) return res.cc(err2)
            // 将用户信息添加到分类列表中
            results[index].friendsList=results[index].friendsList? results[index].friendsList:[]
            // 删除敏感信息
            delete results2[0].password
            results[index].friendsList.push(results2[0])
            resolve()
            // 这里有两次循环 所以我们需要等待两次循环都到最后在返回
            // if(index===results.length-1&&index2===results1.length-1){
            //   // res.send({status:0,message:'获取成功',data:results})
              
            // }
          })
        })
      }
      })
      }))
    })
    // console.log(promises.length)
    Promise.all(promises).then(()=>{
      // console.log(results)
      res.send({status:0,message:'获取成功',data:results})
    }).catch((err)=>{res.cc(err)})
  })

}


// 添加好友分类
exports.addFriendsClass= (req,res)=>{
  const sqlstr="insert into user_friendclass (classname,userid) values (?,?)"
  db.query(sqlstr,[req.body.classname,req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('添加分类失败')
    res.cc('添加分类成功',0)
  })
}


// 退出登录
exports.logout=(req,res)=>{
  const sqlstr='update user_userinfo set online=0 where id=?'
  db.query(sqlstr,req.user.id,(err,results)=>{
    if(err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('退出登录失败！')
    res.send({
      status:0,
      message:'退出登录成功！'
    })
  })
}


// 检测是否退出登录，通过检测是否长时间未进入页面来推测
// 页面进入后台的时间
exports.hidePage=(req,res)=>{
  const nowtime=new Date().getTime()
  setTimeout(()=>{
    const sqlstr='select logintime from user_userinfo where id=?'
    db.query(sqlstr,req.user.id,(err,results)=>{
      if(err) return res.cc(err)
      if(results.length===0) return res.cc('访问数据库失败！')
      const logintime=results[0].logintime
      if(logintime > nowtime) res.cc('目前还在登录')
      else{
        const sqlstr='update user_userinfo set online=0 where id=?'
        db.query(sqlstr,req.user.id,(err,results)=>{
          if(err) return res.cc(err)
          if(results.affectedRows!==1) return res.cc('退出登录失败！')
          res.send({
            status:0,
            message:'用户长时间未进入页面，推测为退出登录'
          })
        })
      }
    })
  },1000*10)
}

// 页面开始的时间
exports.showPage=(req,res)=>{
  const logintime=new Date().getTime()
  const sqlstr='update user_userinfo set logintime=?,online=1 where id=?'
  db.query(sqlstr,[logintime,req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('访问数据库失败')
    res.send({
      status:0,
      message:'用户重新进入页面，更新登录时间'
    })
  })
}

// 获取好友分类
exports.getFriendClass=(req,res)=>{
  const sqlstr='select * from user_friendclass where userid=?'
  db.query(sqlstr,[req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.length===0) return res.send({
      status:0,
      message:'你暂时还没有分类',
      data:results
    })
    results.forEach(item=>{item.value=item.id;delete item.id;delete item.userid})
    res.send({
      status:0,
      message:'获取好友分类成功',
      data:results
    })
  })
}