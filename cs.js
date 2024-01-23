let obj1={name:'tom'}
let obj2=obj1
function fn(obj){
  obj={name:'jerry'}
}
fn(obj2)
console.log(obj2.name)