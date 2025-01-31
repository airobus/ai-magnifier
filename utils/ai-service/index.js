import ConfigManager from '../config-manager'

// AI服务提供商的基础类
class BaseAIProvider {
  analyzeImage(imageData) {
    throw new Error('需要实现analyzeImage方法')
  }

  async textToSpeech(text) {
    throw new Error('需要实现textToSpeech方法')
  }
}

// Cloudflare Workers AI 实现
class CloudflareAI extends BaseAIProvider {
  constructor(config) {
    super()
    this.accountId = config.accountId
    this.apiToken = config.apiToken
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run`
    this.prompts = config.prompts
  }

  analyzeImage(imageData) {
    return new Promise((resolve, reject) => {
      console.log('准备发送请求到Cloudflare AI...')
      
      const binaryString = wx.base64ToArrayBuffer(imageData)
      const uint8Array = new Uint8Array(binaryString)
      
      const requestData = {
        prompt: this.prompts.imageAnalysis,
        image: Array.from(uint8Array),
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        stream: false
      }

      wx.request({
        url: `${this.baseUrl}/@cf/meta/llama-3.2-11b-vision-instruct`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        data: requestData,
        success: (response) => {
          console.log('API响应:', response)
          
          if (!response.data) {
            console.error('API响应数据为空')
            resolve({
              success: false,
              error: 'API响应数据为空'
            })
            return
          }

          if (response.statusCode === 200 && response.data.result) {
            resolve({
              success: true,
              response: response.data.result.response
            })
          } else {
            console.error('API返回错误:', response.data.errors)
            resolve({
              success: false,
              error: response.data.errors?.[0]?.message || 'API调用失败'
            })
          }
        },
        fail: (error) => {
          console.error('请求失败:', error)
          resolve({
            success: false,
            error: `请求失败: ${error.errMsg || error.message || '未知错误'}`
          })
        }
      })
    })
  }

  // 发送同意请求
  sendAgreement() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseUrl}/@cf/meta/llama-3.2-11b-vision-instruct`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          prompt: "agree"
        },
        success: (response) => {
          if (response.statusCode === 200) {
            resolve()
          } else {
            reject(new Error('同意协议失败'))
          }
        },
        fail: reject
      })
    })
  }

  async textToSpeech(text) {
    // 实现文字转语音的逻辑
    // ...
  }
}

// AI服务工厂
class AIServiceFactory {
  static getProvider(type, config) {
    switch (type) {
      case 'cloudflare':
        return new CloudflareAI(config)
      // 可以轻松添加其他AI服务提供商
      // case 'openai':
      //   return new OpenAIProvider(config)
      default:
        throw new Error(`未知的AI服务提供商: ${type}`)
    }
  }
}

export default AIServiceFactory 