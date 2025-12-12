/* Main page of the app */
Page({
    //允许接收服务通知
    //pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc
    //R5sHALA7TKs6jCyH_kwNr9l8vVfWKCU5cXQnFKWlwfA
    async requestSubscribeMessage() {
      // 禁用按钮，防止重复点击
      this.setData({
        dailyDisabled: true
      })
      // Wll2t8ucLt_s9KpgURqSViAhP6dnZHP9Ex6osSTNuq0
      // pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc
        const templateId = getApp().globalData.dailyTempId
        wx.requestSubscribeMessage({
        //tmplIds: [templateId,templateId2,templateId3],
        tmplIds: [templateId],
        success: (res) => {
            if (res[templateId] === 'accept') {
              // 用户同意
               // this.saveSignDate()
              this.saveOpenId()
              
              wx.showToast({
                title: '授权成功'
              })
            } else if (res[templateId] === 'reject'){
              // 用户拒绝
              // wx.openSetting({
              //   withSubscriptions: true,
              // })
              // return
              this.setData({
                showSetModel: true,
                dailyDisabled: false
              })
            } else {
              wx.showToast({
                title: '授权订阅信息有误'
              })
              this.setData({
                dailyDisabled: false
              })
            }
           
        },
        fail: (err) => {
            this.setData({
            requestSubscribeMessageResult: `失败（${JSON.stringify(err)}）`,
            })
            // 20004:用户关闭了主开关，无法进行订阅,引导开启
            if(err.errCode === 20004) {
              this.setData({
                showSetModel: true
              })
            } else {
              wx.showModal({
                title: '提示',
                content: err.errMsg,
                showCancel: false
              })
            }
            this.setData({
              dailyDisabled: false
            })
        },
        })
    },
    //发送消息
    sendSubscribeMessage(e) {
      let time = ''
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const min = date.getMinutes()
        const second = date.getSeconds()
        time = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + second
        //调用云函数，
        wx.cloud.callFunction({
        name: 'signMessage',
        //data是用来传给云函数event的数据，你可以把你当前页面获取消息填写到服务通知里面
        //pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc
        //R5sHALA7TKs6jCyH_kwNr9l8vVfWKCU5cXQnFKWlwfA
        data: {
            action: 'sendSubscribeMessage',
            templateId: 'pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc',//这里我就直接把模板ID传给云函数了
            me:'Test_me',
            name:'Test_activity',
            _openid:'oGR-H4qc26iJHSM4aPTO5jJLUlmI'//填入自己的openid
        },
        success: res => {
            console.warn('[云函数] [openapi] subscribeMessage.send 调用成功：', res)
            wx.showModal({
            title: '发送成功',
            content: '请返回微信主界面查看',
            showCancel: false,
            })
            wx.showToast({
            title: '发送成功，请返回微信主界面查看',
            })
            this.setData({
            subscribeMessageResult: JSON.stringify(res.result)
            })
        },
        fail: err => {
            wx.showToast({
            icon: 'none',
            title: '调用失败',
            })
            console.error('[云函数] [openapi] subscribeMessage.send 调用失败：', err)
        }
      })
    },  
    data: {
        screenWidth: 1000,
        screenHeight: 1000,
        _openid: '',
        showSetModel: false,
        switchChecked: false,
        isDailyed: false, // 是否订阅过
        dailyDisabled: false,
        contactVisible: false,
        buttons: [{text:'取消'},{text: '确认'}],
        message: '',
        isAuthor: false,
        count: 0,
        btnDisabled: false
    },

  
    onLoad() {
      this.getOpenId()
      wx.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
      })
    },
    async toAddPage() {
      if (!this.data.isAuthor) return
      wx.navigateTo({url: '../MissionAdd/index'})
    },
    async getOpenId() { //oGR-H4qc26iJHSM4aPTO5jJLUlmI
      await wx.cloud.callFunction({name: 'getOpenId'}).then(data => {
        this.setData({
          isAuthor: data.result === 'oGR-H4qc26iJHSM4aPTO5jJLUlmI'
        })
      })
    },
    onShow() {
      this.getScreenSize()
      this.checkStatus()
    },  
    //获取页面大小
    async getScreenSize(){
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            screenWidth: res.windowWidth,
            screenHeight: res.windowHeight
          })
        }
      })
    },
    saveSignDate(){
      wx.cloud.callFunction({name: 'saveSignDate'})
    },
    saveOpenId(){
      wx.cloud.callFunction({name: 'saveOpenId', data: {type: 'daily', isNotNew: this.data.isDailyed}}).then(res => {
        this.checkStatus()
      }).catch(e => {
        wx.showModal({
          title: '提示',
          content: e.errMsg,
          showCancel: false
        })
      }).finally(() => {
        this.setData({
          dailyDisabled: false
        })
      })
    },
    closeSetModel() {
      this.setData({
        showSetModel: false
      })
    },
    // switchChange(e) {

    //   this.setData({
    //     switchChecked: e.detail.value
    //   })
    // },
    clearData() {
      wx.cloud.callFunction({name: 'clearTable', data: {tableName: 'user-list'}})
    },
    switchChange(e) {
      //如果已开启通知的话需要跳转设置页手动选择不接收，上面有图
      if (!e.detail.value) {
          wx.openSetting({
              withSubscriptions: true,
          });
          return
      }
      this.requestSubscribeMessage()
      // wx.getSetting({
      //     withSubscriptions: true,
      //     success: (res) => {
          
      //         console.log('subscriptionsSetting', res.subscriptionsSetting)
      //         const tempId = '2dQXjkzpS7Vz1vtnW0UtcoVVxluU-jUZBEFo7D3ubHE'


      //         // 判断用户允许或拒绝总是保持是否推送消息的选择, 如果选择过的话再点击就不显示了，判断有没有itemSettings并且有没有这个订阅消息的模板id
      //         if (res.subscriptionsSetting.itemSettings && res.subscriptionsSetting.itemSettings[tempId]) { 

      //         // 判断用户允许接收订阅通知
      //             if (res.subscriptionsSetting.itemSettings[tempId] == 'accept') {
      //                 this.setData({ switchChecked: true })
      //                 wx.requestSubscribeMessage({
      //                     tmplIds: [tempId],
      //                     success(res) {
      //                         // wx.showToast({
      //                         //     title: '不会再拉起推送消息的授权,订阅成功',
      //                         // })
      //                     },
      //                 })
      //             } else {
      //                 console.log('拒绝了消息推送');
      //         //如果第一次拒绝的话，需要跳转到设置页手动选择接收
      //                 // wx.openSetting({
      //                 //     withSubscriptions: true,
      //                 // });
      //                 this.setData({ switchChecked: false })
      //             }
      //         } else if (res.subscriptionsSetting.mainSwitch) {
      //           this.setData({ switchChecked: false })
      //         //用户只开启接收总通知，并没有这个订阅消息，弹出订阅消息
      //             // wx.requestSubscribeMessage({
      //             //     tmplIds: [tempId],
      //             //     complete: (res) => {
      //             //         console.log(res, '订阅')

      //             //         if (res[tempId] == 'accept') {
      //             //             this.setData({ switchChecked: true })
      //             //         }
      //             //     }
      //             // })
      //         } else {
      //         //用户没有开启通知也没有订阅该消息，跳转设置页打开通知
      //             // wx.openSetting({
      //             //     success(res) {
      //             //         console.log(res.authSetting)
      //             //     }
      //             // })
      //             this.setData({ switchChecked: false })
      //         }

      //     }
      // })

  },
  dailySign () {
    if (this.data.dailyDisabled) {
      wx.showToast({
        title: '操作慢一点',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.count >= 20) {
      wx.showToast({
        title: '次数已达上限，请提醒过后再订阅',
        icon: 'error',
        duration: 2000
      })
      return
    }
    this.requestSubscribeMessage()
  },
  checkStatus () {
    wx.cloud.database().collection('daily-user').where({_openid: getApp().globalData.currentOpenId}).get().then(res => {
      this.setData({
        isDailyed: res.data.length > 0,
        count: res.data.length ? res.data[0].count : 0
      })
    })
  },
  openSetCallback (callback) {
    console.log('callback')
    wx.getSetting({
      withSubscriptions: true,
      success: res => {
        console.log('res', res)
        const tempId = getApp().dailyTempId // 每日签到的templateId

              // 判断用户允许或拒绝总是保持是否推送消息的选择, 如果选择过的话再点击就不显示了，判断有没有itemSettings并且有没有这个订阅消息的模板id
              if (res.subscriptionsSetting.itemSettings && res.subscriptionsSetting.itemSettings[tempId]) {
                if (res.subscriptionsSetting.itemSettings[tempId] == 'accept') {
                  this.saveOpenId()
                }
              }
              this.setData({
                showSetModel: false
              })
      }
    })
  },
  contactMe () {
    this.setData({
      contactVisible: true
    })
  },
  onDescInput (e) {
    this.setData({
      message: e.detail.value
    })
  },
  async tapDialogButton(detail) {
    if (detail.detail.index === 0) {
      this.setData({
        message: '',
        contactVisible: false
      })
      return
    }
    // 对输入框内容进行校验
    if (this.data.message === '') {
      wx.showToast({
        title: '未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    await wx.cloud.callFunction({name: 'contactMe', data: {
      message: this.data.message
    }}).then(() => {
      this.setData({
        message: '',
        contactVisible: false
      })
      wx.showToast({
        title: '已收到',
        duration: 2000
      })
    })
  },
  onShareAppMessage() {
    return {
      title: "欢迎使用我的小程序",
      path: "/pages/MainPage/index",
      imageUrl: "./Images/task.png",
    };
  },

  // 开启朋友圈分享
  onShareTimeline() {
    return {
      title: "欢迎使用我的小程序",
      path: "/pages/MainPage/index",
      imageUrl: "./Images/task.png",
    };
  },
})