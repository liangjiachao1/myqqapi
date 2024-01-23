const db = require('../db/index')

// 获取用户消息列表页的处理函数
exports.getMessage = (req, res) => {
  const sqlstr = 'select * from user_message where sender=? or recipients=? order by time desc'
  db.query(sqlstr, [req.user.id, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if(results.length === 0) return res.cc('用户暂无聊天记录',0)
    // 判断发送方是否为自己，是就是true，不是就false
    results.forEach(v => v.isSelf = (v.sender == req.user.id ? true : false))

    // 对结果进行分类 和同一个联系人的对话放到一起
    const newResults = []
    results.forEach(item => {
      if (item.isSelf) {
        const x = newResults.findIndex(v => v.recipients === item.recipients)
        if (x === -1) {
          newResults.push({
            recipients: item.recipients,
            message: [item],
            noRead: 0,
            avatar: null,
            username: null,
            phone:null
          })
        }
        // 这里只需要获取最新一条信息用于渲染即可，多余的数据不需要
        // else{
        //   newResults[x].message.push(item)
        // }
      }
      else {
        const x = newResults.findIndex(v => v.recipients === item.sender)
        if (x === -1) {
          const y = {
            recipients: item.sender,
            message: [item],
            noRead: 0,
            avatar: null,
            username: null,
            phone:null
          }
          if(item.recipientsRead === 0) y.noRead = 1
          newResults.push(y)
        }
        else {
          if (item.recipientsRead === 0) newResults[x].noRead += 1
        }
      }
    })
    // let count=0
    let promises=[]
    newResults.forEach((item,index)=>{
      // 获取对方的头像和用户名
      promises.push(new Promise((resolve,reject)=>{
        const sqlstrx = 'select avatar,username,phone from user_userinfo where id=?'
      db.query(sqlstrx, [item.recipients], (errx, resultsx) => {
        if (errx) return res.cc(errx)
        item.avatar = resultsx[0].avatar
        item.username = resultsx[0].username
        item.phone = resultsx[0].phone
        resolve()
        // count++
        // if(count===newResults.length-1){
        //   return res.send({
        //     status: 0,
        //     message: '获取成功',
        //     data: newResults
        //   })
        // }
      })
      }))
    })
    Promise.all(promises).then(()=>{
        res.send({
          status: 0,
          message: '获取成功',
          data: newResults
        })
    }).catch((err)=>{res.cc(err)})
  })
}

// 定义一个处理时间的函数
// 因为数据库中传出的时间会比我们这个地区的时间慢8个小时，所以我们需要手动添加8个小时
const formatTime = (time) => {
  return new Date(time + 8 * 60 * 60 * 1000).toLocaleString()
}

// 用户发送消息
exports.sendMessage = (req, res) => {
  const sqlstr = 'insert into user_message set ?'
  const userinfo = {
    // 发送方 id
    sender: req.user.id,
    // 接收方 id
    recipients: +req.body.recipients,
    message: req.body.message,
    time: formatTime(new Date().getTime())
  }
  db.query(sqlstr, userinfo, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('发送失败')
    res.cc('发送成功', 0)
  })
}

// 获取用户聊天详情页面
exports.getMessageDetail=(req,res)=>{
  const sqlstr='select * from user_message where sender=? and recipients=? or sender=? and recipients=? order by time desc'
  db.query(sqlstr,[req.user.id,req.query.recipients,req.query.recipients,req.user.id],(err,results)=>{
    if(err) return res.cc(err)
    if(results.length===0) return res.cc('没有找到相关聊天记录',0)
    if(req.query.pagesize*(req.query.pagenum-1)>=results.length) return res.cc('已经到顶了',0)
    results=results.slice(req.query.pagesize*(req.query.pagenum-1),req.query.pagesize*req.query.pagenum)
    results.forEach((item,index)=>{
      // 判断此条信息是否为号主发送
      item.sender===req.user.id? item.isMy=true:item.isMy=false
      // 判断此条信息与上一条信息的时间差是否超过五分钟 超过五分钟就显示时间，第一条默认显示时间
      if(index===results.length-1) item.timeout=true
      else {
        let time1=new Date(item.time)
        let time2=new Date(results[index+1].time)
        item.timeout=(time1.getTime()-time2.getTime())>1000*60*5? true:false
      }
    })
    // 由于用户获取了两人的聊天记录，所以可以将这两人中有关用户的接收消息全部变为已读
    const sqlstr1='update user_message set recipientsRead=1 where recipients=? and sender=? and recipientsRead=0'
    db.query(sqlstr1,[req.user.id,req.query.recipients],(err1,results1)=>{
      if(err1) return res.cc(err1)
      res.send({
        status:0,
        message:'获取成功',
        data:results
      })
    })

  })
}