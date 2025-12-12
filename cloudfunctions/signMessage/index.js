// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  try {

    const db = cloud.database()
    const _ = db.command



    let taskName = '叮咚～任务上新提醒'
    // 获取发布任务最后一条信息进行推送
    let time = ''
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const min = date.getMinutes()
    const second = date.getSeconds()
    time = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + second
    console.log('1111111111111', time, event)
    const userData = await db.collection('user-list').get()
    const userList = userData.data || []
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
              value: event.title || '新活动'
            },
            thing3: {
              value: '点击进入再次订阅'+`(剩余${user.count - 1}次提醒机会)`
            }
          },
          
          templateId: 'pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc', // 模板ID
          // miniprogramState: 'developer',
          page: `pages/MissionDetail/index?id=${event.missionId}` // 这个是发送完服务通知用户点击消息后跳转的页面
        })
        // 发送成功后将消息的状态改为已发送
        sendPromises.push(await db.collection('user-list').where({
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
