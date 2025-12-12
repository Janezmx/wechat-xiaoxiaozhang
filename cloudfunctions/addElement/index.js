// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()
const db_date =  db.serverDate()

// 云函数入口函数
exports.main = async (context) => {
  return await db.collection('mission-list').add({
    data: {
      _openid: cloud.getWXContext().OPENID,

      createTime: db_date,
      updateTime: db_date,
      title: context.title,
      desc: context.desc,
      dateBegin: context.dateBegin,
      dateEnd: context.dateEnd,
      presetIndex: context.presetIndex,
      imageUrls: context.imageUrls,
      tagIndex: context.tagIndex,
      valueIndex: context.valueIndex,

      // 是否下架
      is_delete: false,
      // 是否封面
      isCover: false,
      // 是否置顶
      isTop: true
    }
  })
}