const express=require('express');
const router=express.Router();

const routerHandler=require('../router_handler/friend');

// 发送好友申请接口
router.post('/send/friendapplication',routerHandler.sendFriendApplication)

// 获取好友申请接口
router.get('/get/friendapplication',routerHandler.getFriendApplication)

// 处理好友申请接口
router.post('/handle/friendapplication',routerHandler.handleFriendApplication)

// 搜索功能
router.get('/search',routerHandler.searchUser)

module.exports=router