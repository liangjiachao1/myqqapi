const express=require('express');
const router=express.Router();

const routerHandler=require('../router_handler/updateinfo');

// 修改名字
router.post('/updatename',routerHandler.updateName);

// 修改头像
router.post('/updateavatar',routerHandler.updateAvatar);

// 修改个性签名
router.post('/updatesignature',routerHandler.updatesignature);

// 修改密码
router.post('/updatepassword',routerHandler.updatepassword);

module.exports=router;