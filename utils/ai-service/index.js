
// AI服务提供商的基础类
class BaseAIProvider {
  analyzeImage(imageData) {
    throw new Error('需要实现analyzeImage方法')
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


}

// Silicon Flow AI 实现
class SiliconFlowAI extends BaseAIProvider {
  constructor(config) {
    super()
    this.apiToken = config.apiToken
    this.baseUrl = 'https://api.siliconflow.cn/v1/chat/completions'
    this.prompts = config.prompts
  }

  analyzeImage(imageData) {
    return new Promise((resolve, reject) => {
      console.log('准备发送请求到Silicon Flow AI...')

      const requestData = {
        model: this.model || 'Qwen/QVQ-72B-Preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`,
                  detail: 'auto'
                }
              },
              {
                type: 'text',
                text: this.prompts.imageAnalysis
              }
            ]
          }
        ],
        stream: false,
        max_tokens: 512,
        stop: ['null'],
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        response_format: {
          type: 'text'
        }
      }

      wx.request({
        url: this.baseUrl,
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

          // 检查响应数据结构
          if (response.statusCode === 200 && 
              response.data.choices && 
              Array.isArray(response.data.choices) && 
              response.data.choices.length > 0 && 
              response.data.choices[0].message && 
              response.data.choices[0].message.content) {
            resolve({
              success: true,
              response: response.data.choices[0].message.content
            })
          } else {
            console.error('API返回错误:', response.data)
            resolve({
              success: false,
              error: '无法解析API响应'
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


}

// AI服务工厂
class AIServiceFactory {
  static getProvider(type, config) {
    switch (type) {
      case 'cloudflare':
        return new CloudflareAI(config)
      case 'siliconflow':
        return new SiliconFlowAI(config)
      default:
        throw new Error(`未知的AI服务提供商: ${type}`)
    }
  }
}

export default AIServiceFactory