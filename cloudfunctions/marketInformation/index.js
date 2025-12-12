// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  try {
    console.log("Sending message with event data:", event);

    let openid = cloud.getWXContext().OPENID;  // 获取用户的openid
    console.log('hhh', openid);
    if (openid === 'oGR-H4qc26iJHSM4aPTO5jJLUlmI') {//_openidA放到单引号里
        openid = 'oGR-H4qc26iJHSM4aPTO5jJLUlmI';//_openidB放到单引号
    } else {
        openid = 'oGR-H4qc26iJHSM4aPTO5jJLUlmI';//_openidA放到单引号里
    }



    let taskName = '叮咚～商品更新提醒'
    let taskDesc = '备注'
    let taskCredit = 0
    // 获取发布任务最后一条信息进行推送
    await cloud.callFunction({ name: 'getList', data: { list: 'MarketList' } }).then(res => {
        const { data } = res.result
        const task = data.filter(task => task._openid == openid)
        if (task.length) {
          const laskTask = task[task.length - 1]
            taskName = laskTask.title
            taskDesc = laskTask.desc
            taskCredit = laskTask.credit
            console.log('info', taskName, taskDesc, taskCredit, taskDesc + '(' + taskCredit + '积分)')
        }
    })
    let time = ''
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const min = date.getMinutes()
    const second = date.getSeconds()
    time = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + second
    console.log('1111111111111', time)
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid, // 发送通知给谁的openid(把上面挑好就行，这块不用动)
      data: {
        thing3: {
          value: taskName + '(' + taskCredit + '积分)'
        },
        time2: {
          value: time
        }
      },
      
      templateId: event.templateId, // 模板ID
      miniprogramState: 'developer',
      page: 'pages/MainPage/index' // 这个是发送完服务通知用户点击消息后跳转的页面
    })
    console.log("Sending message with event data:", event);

    console.log("Message sent successfully:", result);
    return event.startdate
  } catch (err) {
    console.log("Error while sending message:", err);
    return err
  }
}
