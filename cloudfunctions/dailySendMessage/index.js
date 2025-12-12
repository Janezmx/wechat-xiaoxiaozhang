// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})

exports.main = async (event, context) => {
  try {


    const db = cloud.database()
    const _ = db.command
    const userData = await db.collection('daily-user').get()
    console.log('userData', userData)
    const userList = userData.data || []
    // 获取发布任务最后一条信息进行推送
    const sendPromises = []
    userList.forEach(async user => {
      if (user.count === 0) {
        console.log('没有次数')
        return 
      }
      try {
        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: user._openid, // 发送通知给谁的openid
          data: {
            thing1: {
              value: '每日打卡'
            },
            thing3: {
              value: '点击进入再次订阅'+`(剩余${user.count - 1}次提醒机会)`
            }
          },
          
          templateId: 'Wll2t8ucLt_s9KpgURqSViAhP6dnZHP9Ex6osSTNuq0', // 模板ID
          // miniprogramState: 'developer',
          page: `pages/MainPage/index` // 这个是发送完服务通知用户点击消息后跳转的页面
        })
        // 发送成功后将消息的状态改为已发送
        sendPromises.push(await db.collection('daily-user').where({
          _openid: user._openid
        }).update({
          data: {
            count: _.inc(-1) // 自减1
          }
        }))
      } catch (e) {
        return e;
      }
    });

    return Promise.all(sendPromises)
  } catch (err) {
    console.log("Error while sending message:", err);
    return err
  }
}
