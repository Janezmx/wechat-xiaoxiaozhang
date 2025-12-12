// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// wqjQnmWZJXDbjz4qrdkVAxWVYHr2ZKY_zHWU1xZCDn0
// 云函数入口函数
exports.main = async (event, context) => {
  try {


    const db = cloud.database()
    const _ = db.command
    const userData = await db.collection('bank-member').get()
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
            thing2: {
              value: '招商银行-M+会员福利'
            },
            thing11: {
              value: '点击进入再次订阅'+`(剩余${user.count - 1}次提醒机会)`
            }
          },
          
          templateId: 'wqjQnmWZJXDbjz4qrdkVAxWVYHr2ZKY_zHWU1xZCDn0', // 模板ID
          // miniprogramState: 'developer',
          page: `pages/MissionDetail/index?id=cc3a41796774bbdf0416f9740475b379` // 这个是发送完服务通知用户点击消息后跳转的页面
        })
        // 发送成功后将消息的状态改为已发送
        sendPromises.push(await db.collection('bank-member').where({
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