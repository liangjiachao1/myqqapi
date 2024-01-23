// 这是读取用户信息的接口
const express = require('express');
const router = express.Router();

const routerHandler = require('../router_handler/userinfo');

// 获取好友详情
router.get('/friend',routerHandler.getfriendsUserinfo)

// 获取用户好友分类和列表详情
router.get('/friendclass',routerHandler.getfriendsUserinfoList)

// 添加好友分类
router.post('/addfriendclass',routerHandler.addFriendsClass)

// 退出登录
router.post('/logout',routerHandler.logout)

// 页面进入后台
router.post('/hidepage',routerHandler.hidePage)

// 页面重新进入
router.post('/showpage',routerHandler.showPage)

// 获取好友分类
router.get('/friendclassify',routerHandler.getFriendClass)

module.exports = router;