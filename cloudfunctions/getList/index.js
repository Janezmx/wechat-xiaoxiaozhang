// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (context) => {
  // 默认获取所有未下架的数据
  let count = await db.collection('mission-list').where({is_delete: context.is_delete || false}).count()
  count = count.total
  // 计算分几次取
  const batchTimes = Math.ceil(count/100)
  let tasks = []
  for(let i = 0; i < batchTimes; i++) {
    const promise = db.collection('mission-list').where({is_delete: context.is_delete || false}).skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  return (await Promise.all(tasks)).reduce((acc,cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg
    }
  }, {
    data: [],
    errMsg: ''
  })
}