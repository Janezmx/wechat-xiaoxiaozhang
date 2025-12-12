App({
  async onLaunch() {
    

    this.initcloud()

    this.globalData = {
      
      
      authorOpenId: '', // 管理员openid
      currentOpenId: '', // 当前用户openid

      dailyTempId: 'Wll2t8ucLt_s9KpgURqSViAhP6dnZHP9Ex6osSTNuq0', // 每日打卡提醒tempId
      addTempId: 'pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc', // 提醒tempId

      //用于存储待办记录的集合名称
      collectionMissionList: 'MissionList',
      collectionMarketList: 'MarketList',
      collectionStorageList: 'StorageList',
      collectionUserList: 'UserList',

      presets: [{
        name:"每日",
      },{
        name:"每周",
      },{
        name:"每月",
      },{
        name:"限时",
      }],
      tags: [{
        name:"微信",
      },{
        name:"支付宝",
      },{
        name:"云闪付",
      },{
        name:"京东",
      },{
        name:"淘宝",
      },{
        name:"银行",
      },{
        name:"其他",
      }],
      values: [{
        name:"实物",
        image: 'Images/gift.jpg'
      },{
        name:"零钱/红包",
        image: 'Images/pink_coin.jpg'
      },{
        name:"卡券",
        image: 'Images/pink_ticket.jpg'
      },{
        name:"其他",
        image: 'Images/question.jpg'
      }]
    }
  },

  flag: false,

  /**
   * 初始化云开发环境
   */
  async initcloud() {
    const normalinfo = require('./envList.js').envList || [] // 读取 envlist 文件
    if (normalinfo.length != 0 && normalinfo[0].envId != null) { // 如果文件中 envlist 存在
      wx.cloud.init({ // 初始化云开发环境
        traceUser: true,
        env: normalinfo[0].envId
      })
      // 装载云函数操作对象返回方法
      this.cloud = () => {
        return wx.cloud // 直接返回 wx.cloud
      }
      // 获取用户列表设置数据
      await this.checkStatus()
    } else { // 如果文件中 envlist 不存在，提示要配置环境
      this.cloud = () => {
        wx.showModal({
          content: '无云开发环境', 
          showCancel: false
        })
        throw new Error('无云开发环境')
      }
    }
  },

  // 获取云数据库实例
  async database() {
    return (await this.cloud()).database()
  },
  // 获取用户列表设置数据
  async checkStatus () {
    const currentUser = await wx.cloud.callFunction({name: 'getOpenId'})
    const author = await wx.cloud.database().collection('author').get()
    this.globalData.authorOpenId = author.data[0]._openid // 当前管理员openid
    this.globalData.currentOpenId = currentUser.result // 当前用户openid
    wx.cloud.database().collection('user-list').where({_openid: currentUser.result}).get().then(res => {
      this.globalData.isAdded = res.data.length > 0
    })
  }
})