// app.js
App({
  onLaunch() {
    // 初始化
    if (wx.canIUse('getSystemInfoSync.return.windowWidth')) {
      this.globalData.systemInfo = wx.getSystemInfoSync()
    }
  },
  globalData: {
    systemInfo: null
  }
})
