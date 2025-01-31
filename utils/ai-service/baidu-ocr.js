class BaiduOCR extends BaseAIProvider {
  constructor(config) {
    super()
    this.apiKey = config.apiKey
    this.secretKey = config.secretKey
    this.accessToken = null
    this.baseUrl = 'https://aip.baidubce.com/rest/2.0/ocr/v1'
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken

    const response = await wx.request({
      url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`,
      method: 'POST'
    })

    if (response.data.access_token) {
      this.accessToken = response.data.access_token
      return this.accessToken
    }
    throw new Error('获取access_token失败')
  }

  analyzeImage(imageData) {
    return new Promise(async (resolve, reject) => {
      try {
        const accessToken = await this.getAccessToken()
        
        wx.request({
          url: `${this.baseUrl}/general_basic?access_token=${accessToken}`,
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: {
            image: imageData
          },
          success: (response) => {
            if (response.data.words_result) {
              const text = response.data.words_result
                .map(item => item.words)
                .join('\n')
              resolve({
                success: true,
                response: text
              })
            } else {
              resolve({
                success: false,
                error: '识别失败'
              })
            }
          },
          fail: (error) => {
            resolve({
              success: false,
              error: error.errMsg || '请求失败'
            })
          }
        })
      } catch (error) {
        resolve({
          success: false,
          error: error.message
        })
      }
    })
  }
} 