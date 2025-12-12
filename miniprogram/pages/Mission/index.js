var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    screenWidth: 1000,
    screenHeight: 1000,

    search: "",

    allMissions: [],
    missionList: [],
    coverList: [],

    isAuthor: getApp().authorOpenId === getApp().currentOpenId,
    slideButtons: [
      {extClass: 'markBtn', text: '编辑', src: "Images/icon_mark.svg"},
      {extClass: 'starBtn', text: '编辑', src: "Images/icon_star.svg"},
      {extClass: 'removeBtn', text: '删除', src: 'Images/icon_del.svg'},
      {extClass: 'removeBtn', text: '置顶', src: 'Images/top.svg'},
    ],

    presets: getApp().globalData.presets,
    tags:getApp().globalData.tags,
    values: getApp().globalData.values,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    startX: 0, //开始x坐标
    startY: 0, //开始y坐标
  },

  onLoad() {
    this.getOpenId()
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    })
    var that = this;
    wx.getSystemInfo({
        success: function(res) {
            that.setData({
                sliderLeft: (res.windowWidth / that.data.presets.length - sliderWidth) / 2,
                sliderOffset: res.windowWidth / that.data.presets.length * that.data.activeIndex
            });
        }
    });
  },
  tabClick: function (e) {
    this.setData({
        sliderOffset: e.currentTarget.offsetLeft,
        activeIndex: Number(e.currentTarget.id)
    });
    this.filterMission()
  },
  onShareAppMessage() {
    return {
      title: "欢迎使用我的小程序",
      path: "/pages/Mission/index",
      imageUrl: "./Images/task.png",
    };
  },

  // 开启朋友圈分享
  onShareTimeline() {
    return {
      title: "欢迎使用我的小程序",
      path: "/pages/Mission/index",
      imageUrl: "./Images/task.png",
    };
  },
  async getOpenId() { //oGR-H4qc26iJHSM4aPTO5jJLUlmI
    await wx.cloud.callFunction({name: 'getOpenId'}).then(data => {
      this.setData({
        isAuthor: data.result === 'oGR-H4qc26iJHSM4aPTO5jJLUlmI'
      })
    })
  },
  //页面加载时运行
  async onShow(){
    await wx.cloud.callFunction({name: 'getList'}).then(data => {
      const list = data.result.data
      list.sort(function(a, b) {
        return new Date(a.dateBegin) - new Date(b.dateBegin);
      })
      list.sort(function(a, b) {
        return a.tagIndex - b.tagIndex
      })
      list.forEach(item => {
        const now = new Date().getTime()
        const time = new Date(item.createTime).getTime()
        if (now - time < 72 * 3600 * 1000) {
          item.isNew = true
        }
      })
      this.setData({allMissions: list})
      this.setData({
        coverList: list.filter(item => !!item.isCover)
      })
      this.filterMission()
      this.getScreenSize()
    })
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

  //转到任务详情
  async toDetailPage(element) {
    wx.navigateTo({url: '../MissionDetail/index?id=' + element.currentTarget.dataset.id})
  },

  //设置搜索
  onSearch(element){
    this.setData({
      search: element.detail.value
    })

    this.filterMission()
  },

  //将任务划分为：有效、过期
  filterMission(){
    let missionList = []
    const search = this.data.search
    for(let i in this.data.allMissions){
      if((!search || this.data.allMissions[i].title.match(search) != null) && this.data.activeIndex === this.data.allMissions[i].presetIndex){
        missionList.push(this.data.allMissions[i])
      }
    }
    missionList.sort(function(a, b) {
      if (a.isTop) {
        return -1;  // 将a置顶
      } else if (b.isTop) {
        return 1;   // 将b置顶
      } else {
        return 0
      }
    })
    this.setData({
      missionList
    })
  },


  //响应左划按钮事件逻辑
  async slideButtonTap(element){
    //得到UI序号
    const {index} = element.detail

    //根据序号获得任务
    const missionId = element.currentTarget.dataset.id
    const missionIndex = element.currentTarget.dataset.index
    const missionCover = element.currentTarget.dataset.cover
    const missionTop = element.currentTarget.dataset.top

    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid => {

        //处理完成点击事件
        //if(mission._openid === openid.result){
            //处理编辑按钮点击事件
            if (index === 0) {
              wx.navigateTo({url: `../MissionAdd/index?id=${missionId}`})
            }

            //处理删除按钮点击事件
            else if (index === 2) {
                await wx.cloud.callFunction({name: 'deleteElement', data: {_id: missionId}}).then(() => {
                  //更新本地数据
                  this.data.missionList.splice(missionIndex, 1)
                  //触发显示更新
            this.setData({missionList: this.data.missionList})
                })
                // 处理设置封面
            } else if (index === 1) {
              await wx.cloud.callFunction({name: 'setCover', data: {_id: missionId, isCover: !missionCover}}).then(() => {
                //更新本地数据
                const item = this.data.missionList[missionIndex]
                item.isCover = !missionCover
                const coverItem = this.data.allMissions.find(item => item._id === missionId)
                coverItem.isCover = !missionCover
                this.setData({
                  coverList: this.data.allMissions.filter(item => !!item.isCover)
                })
                //触发显示更新
            this.setData({missionList: this.data.missionList})
              })
            } else if (index === 3) {
              await wx.cloud.callFunction({name: 'setTop', data: {_id: missionId, isTop: !missionTop}}).then(() => {
                //更新本地数据
                const item = this.data.missionList[missionIndex]
                item.isTop = !missionTop
                const coverItem = this.data.allMissions.find(item => item._id === missionId)
                coverItem.isTop = !missionTop
                //触发显示更新
                this.filterMission()
            })
          }



        //如果编辑的不是自己的任务，显示提醒
        //}
    })
  },

  //完成任务
  async finishMission(element) {
    //根据序号获得触发切换事件的待办
    const missionIndex = element.currentTarget.dataset.index
    const mission = this.data.unfinishedMissions[missionIndex]

    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid => {
      if(mission._openid != openid.result){
        //完成对方任务，奖金打入对方账号
        await wx.cloud.callFunction({name: 'editAvailable', data: {_id: mission._id, value: false, list: getApp().globalData.collectionMissionList}})
        await wx.cloud.callFunction({name: 'editCredit', data: {_openid: mission._openid, value: mission.credit, list: getApp().globalData.collectionUserList}})

        //触发显示更新
        mission.available = false
        this.filterMission()

        //显示提示
        wx.showToast({
            title: '任务完成',
            icon: 'success',
            duration: 2000
        })

      }else{
        wx.showToast({
          title: '不能完成自己的任务',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },

  touchstart: function (e) {
    if (!this.data.isAuthor) return
    //开始触摸,重置所有左滑内容
    this.data.missionList.forEach(function (item, idx) {
      if (item.isTouchMove) //只操作为true的
        item.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      missionList: this.data.missionList
    })
  },
  //滑动事件
  touchEvent(e) {
    if (!this.data.isAuthor) return
    var that = this, //防止this指向问题
        index = e.currentTarget.dataset.index, //当前下标
        startX = that.data.startX, //开始X坐标
        startY = that.data.startY, //开始Y坐标
        touchMoveX = e.changedTouches[0].clientX, //滑动变化x坐标
        touchMoveY = e.changedTouches[0].clientY, //滑动变化y坐标
        //获取滑动角度
        angle = that.angle({
          X: startX,
          Y: startY
        }, {
          X: touchMoveX,
          Y: touchMoveY
        });
    that.data.missionList.forEach(function (item, idx) {
      item.isTouchMove = false
      //滑动超过30度，函数返回指定数字 x 的绝对值
      if (Math.abs(angle) > 30) return;
      if (idx == index) {
        if (touchMoveX > startX) //右滑
          item.isTouchMove = false
        else //左滑
          item.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      missionList: that.data.missionList
    })
  },
  // 计算滑动角度，start 起点坐标，end 终点坐标
  angle: function (start, end) {
    var _X = end.X - start.X,
        _Y = end.Y - start.Y
    //返回角度 Math.atan()函数返回一个数值的反正切（以弧度为单位）
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  editItem (e) {
    if (!this.data.isAuthor) return
    const missionId = e.currentTarget.dataset.id
    wx.navigateTo({url: `../MissionAdd/index?id=${missionId}`})
  },
  async deleteItem (e) {
    if (!this.data.isAuthor) return
    const missionId = e.currentTarget.dataset.id
    const missionIndex = e.currentTarget.dataset.index
    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid =>{
      await wx.cloud.callFunction({name: 'deleteElement', data: {_id: missionId}}).then(() => {
        //更新本地数据
        this.data.missionList.splice(missionIndex, 1)
        //触发显示更新
        this.setData({missionList: this.data.missionList})
      })
    })
  },
  async setTop (e) {
    if (!this.data.isAuthor) return
    const missionId = e.currentTarget.dataset.id
    const missionIndex = e.currentTarget.dataset.index
    const missionTop = e.currentTarget.dataset.top
    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid =>{
      await wx.cloud.callFunction({name: 'setTop', data: {_id: missionId, isTop: !missionTop}}).then(() => {
        //更新本地数据
        const item = this.data.missionList[missionIndex]
        item.isTop = !missionTop
        const coverItem = this.data.allMissions.find(item => item._id === missionId)
        coverItem.isTop = !missionTop
        //触发显示更新
        this.filterMission()
      })
    })
  }
})
