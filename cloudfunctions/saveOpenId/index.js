// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command

  // const res = await cloud.callFunction({ //调用云函数getdate
  //   // 要调用的云函数名称
  //   name: 'getdata',
  // })
  // const arr = res.result.data
  const map = {
    daily: 'daily-user',
    add: 'user-list',
    'sunday-user': 'sunday-user',
    'twentysix-user': 'twentysix-user',
    'buyten-user': 'buyten-user',
    'shanghai-user': 'shanghai-user',
    'bank-member': 'bank-member',
    'yzf-user': 'yzf-user',
    'water-user': 'water-user'
  }
  const table = map[event.type]
  if (event.isNotNew) {
    return await db.collection(table).where({
      _openid: cloud.getWXContext().OPENID
    }).update({
      data: {
        count: _.inc(1) // 自增1
      }
    })
  } else {
    return await db.collection(table).add({
      data: {
        _openid: wxContext.OPENID,
        count: 1
      }
    })
  }
  
}