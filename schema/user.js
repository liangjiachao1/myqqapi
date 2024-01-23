// 对用户登录以及注册的信息规则进行检验

const joi = require('joi');

const phone=joi.string().pattern(/^\d{11}$/).required()
const password=joi.string().pattern(/^\S{8,16}$/).required();

exports.login_schema={
  body:{
    phone,
    password
  }
}