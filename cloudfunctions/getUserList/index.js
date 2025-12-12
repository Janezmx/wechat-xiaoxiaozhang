// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const $ = db.command.aggregate
  return await db.collection('user-list').aggregate()
  .group({
    _id: '$_openid'
  })
  .end()
}