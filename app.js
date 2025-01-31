// app.js
import ConfigManager from './utils/config-manager'

App({
  async onLaunch() {
    // 初始化配置
    await ConfigManager.initConfig()
  },
  globalData: {
    systemInfo: null
  }
})
