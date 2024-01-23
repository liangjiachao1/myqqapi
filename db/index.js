const mySql=require('mysql');

const db=mySql.createPool({
  host:'127.0.0.1',
  user:'root',
  password:'admin123',
  database:'my_qq'
})

module.exports=db