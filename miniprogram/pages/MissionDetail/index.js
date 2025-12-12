let videoAd = null // 激励广告
Page({
  // 保存任务的 _id 和详细信息
  data: {
    _id: '',
    mission: null,
    dateStr: '',
    timeStr: '',
    imageUrls: [],
    updateTime: '',
    title: '',
    desc: '',
    dateBegin: '',
    dateEnd: '',
    preset: '',
    tag: '',
    value: '',
    list: getApp().globalData.collectionMissionList,
    presets: getApp().globalData.presets,
    tags:getApp().globalData.tags,
    values: getApp().globalData.values,
    visible: false,
    buttons: [{text:'取消'},{text: '确认'}],
    addDisabled: false, // 按钮防重复点击
    isAdded: false, // 是否订阅过下一次提醒
    addCount: 0,
    showSetModel: false,
    templateId: '',
    temMessage: '',
    isCustomed: false, // 是否订阅过下一次提醒
    showTemModel: false,
    temDb: '', // 定制订阅数据库名称
    customCount: 0,
    customDisabled: false
  },

  onLoad(options) {
    // 保存上一页传来的 _id 字段，用于查询任务
    if (options.id !== undefined) {
      this.setData({
        _id: options.id
      })
    }
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });
    this.checkStatus()

  },
  checkStatus () {
    wx.cloud.database().collection('user-list').where({_openid: getApp().globalData.currentOpenId}).get().then(res => {
      this.setData({
        isAdded: res.data.length > 0,
        addCount: res.data.length ? res.data[0].count : 0
      })
    })

  },
  async requestMessage() {
    if (this.data.addDisabled) {
      wx.showToast({
        title: '操作慢一点',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.addCount >= 20) {
      wx.showToast({
        title: '次数已达上限，请提醒过后再订阅',
        icon: 'error',
        duration: 2000
      })
      return
    }
    // 禁用按钮，防止重复点击
    this.setData({
      addDisabled: true
    })
    // Wll2t8ucLt_s9KpgURqSViAhP6dnZHP9Ex6osSTNuq0
    // pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc
      const templateId = getApp().globalData.addTempId
      wx.requestSubscribeMessage({
      //tmplIds: [templateId,templateId2,templateId3],
      tmplIds: [templateId],
      success: (res) => {
          if (res[templateId] === 'accept') {
            // 用户同意
             // this.saveSignDate()
            this.saveOpenId('add')
            
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
              addDisabled: false
            })
          } else {
            wx.showToast({
              title: '授权订阅信息有误'
            })
            this.setData({
              addDisabled: false
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
            addDisabled: false
          })
      },
      })
  },
  watchAd () {
    console.log('ad', videoAd)
    // 用户触发广告后，显示激励视频广告
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            wx.showModal({
              title: '提示',
              content: '广告显示失败',
              showCancel: false
            })
            console.error('激励视频 广告显示失败', err)
          })
      })
    }
  },
  closeModel () {
    this.setData({
      showTemModel: false
    })
  },
  async requestMessageCustom() {
    if (this.data.customDisabled) {
      wx.showToast({
        title: '操作慢一点',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.customCount >= 20) {
      wx.showToast({
        title: '次数已达上限，请提醒过后再订阅',
        icon: 'error',
        duration: 2000
      })
      return
    }
    // 禁用按钮，防止重复点击
    this.setData({
      customDisabled: true
    })
    // Wll2t8ucLt_s9KpgURqSViAhP6dnZHP9Ex6osSTNuq0
    // pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc
      const templateId = this.data.templateId
      wx.requestSubscribeMessage({
      //tmplIds: [templateId,templateId2,templateId3],
      tmplIds: [templateId],
      success: (res) => {
          if (res[templateId] === 'accept') {
            // 用户同意
             // this.saveSignDate()
            this.saveOpenId(this.data.temDb)
            
            wx.showToast({
              title: '授权成功'
            })
            this.setData({
              customDisabled: false
            })
          } else if (res[templateId] === 'reject'){
            // 用户拒绝
            // wx.openSetting({
            //   withSubscriptions: true,
            // })
            // return
            this.setData({
              showSetModel: true,
              customDisabled: false
            })
          } else {
            wx.showToast({
              title: '授权订阅信息有误'
            })
            this.setData({
              customDisabled: false
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
            customDisabled: false
          })
      },
      })
  },
  saveOpenId(type){
    wx.cloud.callFunction({name: 'saveOpenId', data: {type, isNotNew: type === 'add' ? this.data.isAdded : this.data.isCustomed}}).then(res => {
      this.checkStatus()
      if (type !== 'add' && this.data.templateId) {
        wx.cloud.database().collection(this.data.temDb).where({_openid: getApp().globalData.currentOpenId}).get().then(res => {
          this.setData({
            isCustomed: res.data.length > 0,
            customCount: res.data.length ? res.data[0].count : 0
          })
        })
      }
    }).catch(e => {
      wx.showModal({
        title: '提示',
        content: e.errMsg,
        showCancel: false
      })
    }).finally(() => {
      this.setData({
        addDisabled: false
      })
    })
  },
  onShareAppMessage() {
    return {
      title: this.data.title,
      path: `/pages/MissionDetail/index?id=${this.data._id}`,
      imageUrl: this.data.imageUrl,
    };
  },

  // 开启朋友圈分享
  onShareTimeline() {
    return {
      title: this.data.title,
      path: `/pages/MissionDetail/index?id=${this.data._id}`,
      imageUrl: "./Images/task.png",
    };
  },
  getDate(dateStr){
    const milliseconds = Date.parse(dateStr)
    const date = new Date()
    date.setTime(milliseconds)
    return date
  },

  // 根据 _id 值查询并显示任务
  async onShow() {
    if (this.data._id.length > 0) {
      // 根据 _id 拿到任务
      const thisData = this.data
      await wx.cloud.callFunction({name: 'getElementById', data: this.data}).then(data => {
      
        const resData = data.result.data[0]
        // 将任务保存到本地，更新显示
        this.setData({
          dateStr: this.getDate(resData.updateTime).toDateString(),
          timeStr: this.getDate(resData.updateTime).toTimeString(),
          title: resData.title,
          desc: resData.desc,
          dateBegin: resData.dateBegin,
          dateEnd: resData.dateEnd,
          preset: thisData.presets[resData.presetIndex].name,
          imageUrls: resData.imageUrls || (resData.imageUrl ? [resData.imageUrl] : []),
          tag: thisData.tags[resData.tagIndex].name,
          value: thisData.values[resData.valueIndex].name,
          templateId: resData.templateId || '',
          temMessage: resData.temMessage || '',
          temDb: resData.temDb || ''
        })
        // isCustomed
        if (this.data.templateId) {
          wx.cloud.database().collection(this.data.temDb).where({_openid: getApp().globalData.currentOpenId}).get().then(res => {
            this.setData({
              isCustomed: res.data.length > 0,
              customCount: res.data.length ? res.data[0].count : 0
            })
            if (wx.createRewardedVideoAd) {
              videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-9e91ecfeaa4e032b'
              })
              videoAd.onLoad(() => {})
              videoAd.onError((err) => {
                console.error('激励视频光告加载失败', err)
              })
              videoAd.onClose((res) => {
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                  this.setData({
                    showTemModel: true
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '观看时长不够',
                    showCancel: false
                  })
                }
              })
            }
          })
        }
      
      })
    }
  },
  toMissionPage() {
    wx.switchTab({url: '../Mission/index'})
  },
  previewImage(e){
    wx.previewImage({
      current: e.currentTarget.dataset.url,//当前点击的预览图片链接
      urls: this.data.imageUrls,//需要预览的图片列表
    })
},
closeSetModel() {
  this.setData({
    showSetModel: false
  })
},
openSetCallback (callback) {
  wx.getSetting({
    withSubscriptions: true,
    success: res => {
      const tempId = getApp().addTempId // 新任务的templateId

            // 判断用户允许或拒绝总是保持是否推送消息的选择, 如果选择过的话再点击就不显示了，判断有没有itemSettings并且有没有这个订阅消息的模板id
            if (res.subscriptionsSetting.itemSettings && res.subscriptionsSetting.itemSettings[tempId]) {
              if (res.subscriptionsSetting.itemSettings[tempId] == 'accept') {
                this.saveOpenId('add')
              } else {
                this.setData({
                  addDisabled: false
                })
              }
            } else {
              this.setData({
                addDisabled: false
              })
            }
    }
  })
},
showDialog(){
  this.setData({
    visible: true
  })
}
})