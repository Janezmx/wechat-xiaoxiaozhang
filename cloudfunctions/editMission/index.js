// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (context) => {
  console.log('editMission', context)
  const db = cloud.database()
  const db_date =  db.serverDate()

  return await db.collection('mission-list').where({
    _id: context._id
  }).update({
    data: {
      _openid: cloud.getWXContext().OPENID,

      title: context.title,
      desc: context.desc,
      dateBegin: context.dateBegin,
      dateEnd: context.dateEnd,
      presetIndex: context.presetIndex,
      imageUrls: context.imageUrls,
      tagIndex: context.tagIndex,
      valueIndex: context.valueIndex,
      updateTime: db_date
    }
  })
}