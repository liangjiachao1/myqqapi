const express=require('express');
const router=express.Router();

const routerHandler=require('../router_handler/userChat');

// 获取聊天信息列表页
router.get('/message',routerHandler.getMessage)

// 发送聊天信息
router.post('/sendmessage',routerHandler.sendMessage)

// 获取聊天详情
router.get('/getdetail',routerHandler.getMessageDetail)

module.exports=router;