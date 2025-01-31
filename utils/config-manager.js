class ConfigManager {
  static KEY = 'AI_CONFIG'

  static setConfig(config) {
    wx.setStorageSync(this.KEY, config)
  }

  static getConfig() {
    return wx.getStorageSync(this.KEY) || null
  }

  static async initConfig() {
    // 使用默认配置
    const defaultConfig = {
      accountId: '8483c3ec7a0cbc54a8d660b5b9002b04',
      apiToken: 'oa5hvFw9FypFYxIIaP7Z1Z7aE8NipHBeNmb7Zw3u'
    }
    
    // 如果没有配置，使用默认配置
    if (!this.getConfig()) {
      this.setConfig(defaultConfig)
    }
    return this.getConfig()
  }
}

export default ConfigManager 