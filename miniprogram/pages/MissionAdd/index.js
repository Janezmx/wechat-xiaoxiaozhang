Page({
    //增加消息接收与发送功能
    async handleTap() {
        await this.saveMission();
  }, 
  //保存正在编辑的任务
  data: {
    _id: '',
    title: '',
    desc: '',
    dateBegin: '',
    dateEnd: '',
    presetIndex: 0,
    imageUrls: [],
    presets: getApp().globalData.presets,
    tagIndex: 0,
    tags:getApp().globalData.tags,
    valueIndex: 0,
    values: getApp().globalData.values,
    list: getApp().globalData.collectionMissionList,
  },

  onLoad(options) {
    // 保存上一页传来的 _id 字段，用于查询任务
    if (options.id !== undefined) {
      this.setData({
        _id: options.id
      })
      wx.setNavigationBarTitle({
        title: '编辑任务'
    })
      wx.cloud.callFunction({name: 'getElementById', data: this.data}).then(data => {
        const resData = data.result.data[0]
        // 将任务保存到本地，更新显示
        this.setData({
          mission: resData,
          title: resData.title,
          desc: resData.desc,
          dateBegin: resData.dateBegin,
          dateEnd: resData.dateEnd,
          presetIndex: Number(resData.presetIndex),
          imageUrls: resData.imageUrls || (resData.imageUrl ? [resData.imageUrl] : []),
          tagIndex: Number(resData.tagIndex),
          valueIndex: Number(resData.valueIndex),
        })
      })
    }
  },
  //数据输入填写表单
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },
  onDescInput(e) {
    this.setData({
      desc: e.detail.value
    })
  },
  onCreditInput(e) {
    this.setData({
      credit: e.detail.value
    })
  },
  onPresetChange(e){
    this.setData({
      presetIndex: e.detail.value
    })
  },
  onTagChange(e) {
    this.setData({
      tagIndex: e.detail.value
    })
  },
  bindDateBeginChange(e) {
    this.setData({
      dateBegin: e.detail.value
    })
  },
  bindDateEndChange(e) {
    this.setData({
      dateEnd: e.detail.value
    })
  },
  onValueChange(e) {
    this.setData({
      valueIndex: e.detail.value
    })
  },

  //保存任务
  async saveMission() {
    if (getApp().authorOpenId !== getApp().currentOpenId) {
      wx.showToast({
        title: '非管理员',
        icon: 'error',
        duration: 2000
      })
      return
    }
    // 对输入框内容进行校验
    if (this.data.title === '') {
      wx.showToast({
        title: '标题未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    
    
    const paramsData = this.data
    await wx.cloud.callFunction({name: this.data._id ? 'editMission':'addElement', data: {
          _id: paramsData._id,
          title: paramsData.title,
          desc: paramsData.desc,
          dateBegin: paramsData.dateBegin,
          dateEnd: paramsData.dateEnd,
          presetIndex: Number(paramsData.presetIndex),
          imageUrls: paramsData.imageUrls,
          tagIndex: Number(paramsData.tagIndex),
          valueIndex: Number(paramsData.valueIndex),
    }}).then(
      async(res) => {
          wx.showToast({
              title: `${this.data._id ? '编辑':'添加'}成功`,
              icon: 'success',
              duration: 1000
          })
          if (this.data._id) return
          // await wx.cloud.callFunction({name: 'getUserList', data: {list: getApp().globalData.collectionMissionList}}).then(data => {
          //   const userList = data.result.list || []
          //   this.sendSubscribeMessage(res.result._id, userList)
          // })
          this.sendSubscribeMessage(res.result._id)
      }
    )
    setTimeout(function () {
        wx.navigateBack()
    }, 1000)
  },
     //上传图片  
     addImg () {
      var self = this;

      // 开始上传图片到服务器
      wx.chooseImage({
          count: 3, // 设置最多可以选择的图片数量，默认为9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function(res) {
              var tempFilePath = res.tempFilePaths;

              self.setData({
                imageUrls: tempFilePath
               });
          },
          fail: function(err) {
              console.error('Choose image failed:', err);
          },
      });
  },
  uploadImage () {
    const imageUrls = []
    this.data.imageUrls.forEach((item, index) => {
      wx.cloud.uploadFile({
                cloudPath: new Date().getTime()+ index +'.jpg', // 上传至云端的路径
                filePath: item, // 小程序临时文件路径
                success: res => {
                  // 返回文件 ID
                  imageUrls.push({
                    index,
                    url: res.fileID
                  })
                  if (imageUrls.length === this.data.imageUrls.length) {
                    // 按照选择图片的顺序排序
                    imageUrls.sort(function(a, b){
                      return a.index - b.index
                    })
                    this.setData({
                      imageUrls: imageUrls.map(item => item.url) // 假设返回结果中的imageUrl字段是上传后图片的服务器地址
                    })
                    wx.showToast({
                      title: '上传成功',
                      icon: 'success',
                      duration: 2000
                    })
                  }
                  // wx.cloud.getTempFileURL({
                  //   fileList:[res.fileID],
                  //   success(res){
                  //     console.log('demo picture url',res);
                  //     console.log(res.fileList[0])
                  //     console.log('getTempFileURL', res.fileList[0].tempFileURL)
                  //     this.setData({
                  //       imageUrl: res.fileList[0].tempFileURL // 假设返回结果中的imageUrl字段是上传后图片的服务器地址
                  //     })
                  //   },
                   
                  // })
                },
                fail: e => {
                  wx.showToast({
                    title: '上传失败',
                    icon: 'error',
                    duration: 2000
                  })
                }
              })
    })
  },

  // 重置所有表单项
  resetMission() {
    this.setData({
      title: '',
      desc: '',
      credit: '',
      presetIndex: 0,
      tagIndex: 0,
      valueIndex: 0,
      imageUrls: [],
      list: getApp().globalData.collectionMissionList,
    })
  },
  //发送消息
  sendSubscribeMessage(id) {
    const title = this.data.title
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
      const promise = new Promise(function(resolve, reject){
        wx.cloud.callFunction({
          name: 'signMessage',
          //data是用来传给云函数event的数据，你可以把你当前页面获取消息填写到服务通知里面
          //pWAWIG8scMazpA3iSQuFwMNtVRRFp316eo7-hjI1iAc
          //R5sHALA7TKs6jCyH_kwNr9l8vVfWKCU5cXQnFKWlwfA
          data: {
              action: 'sendSubscribeMessage',
              me:'Test_me',
              name:'Test_activity',
              missionId: id,
              title
          },
          success: res => {
              console.warn('[云函数] [openapi] subscribeMessage.send 调用成功：', res)
              wx.showToast({
              title: '发送成功，请返回微信主界面查看',
              })
              resolve(res);
          },
          fail: err => {
              wx.showToast({
              icon: 'none',
              title: '调用失败',
              })
              console.error('[云函数] [openapi] subscribeMessage.send 调用失败：', err)
              reject(new Error('[云函数] [openapi] subscribeMessage.send 调用失败'))
          }
        })
      })
      promise.then(res => {
        console.log('发送完毕',res)
      }).catch(err => [
        console.log('发送失败', err)
      ])
  },  
  clearData() {
    wx.cloud.callFunction({name: 'clearTable', data: {tableName: 'user-list'}})
  },
  clearDate () {
    this.setData({
      dateBegin: '',
      dateEnd: ''
    })
  }
})