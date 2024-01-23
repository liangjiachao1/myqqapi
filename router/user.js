// 这是用户登录的接口
const express = require('express');
const router = express.Router();

const routerHandler=require('../router_handler/user')

// 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要验证的规则
const {login_schema} = require('../schema/user')

// 登录和注册接口一起
router.post('/login',expressJoi(login_schema),routerHandler.loginUser)


module.exports = router
