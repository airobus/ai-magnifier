// index.js
import AIServiceFactory from '../../utils/ai-service/index'
import config from '../../config/index'

Page({
  data: {
    imageUrl: '',
    streamResponse: '',
    isAnalyzing: false,
    scrollToView: '',
    currentIndex: 0,
    fontSize: 36,
    // 添加结构化数据
    resultSections: {
      basicInfo: '',
      usage: '',
      notices: ''
    }
  },

  onLoad() {
    // 初始化云开发
    wx.cloud.init({
      env: 'your-env-id' // 替换为您的云环境ID
    })

    // 初始化AI服务
    this.aiService = AIServiceFactory.getProvider(
      config.ai.provider,
      config.ai[config.ai.provider]
    )
  },

  // 拍照或选择图片
  chooseImage(e) {
    const source = e.currentTarget.dataset.source;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: [source], // 根据按钮传入的source决定来源
      success: (res) => {
        this.setData({
          imageUrl: res.tempFiles[0].tempFilePath,
          isAnalyzing: true
        })
        this.analyzeImage(res.tempFiles[0].tempFilePath)
      }
    })
  },

  // 分析图片
  analyzeImage(imagePath) {
    this.setData({ 
      isAnalyzing: true,
      streamResponse: ''  // 清空之前的响应
    })
    
    this.imageToBase64(imagePath)
      .then(imageData => {
        return this.aiService.analyzeImage(imageData)
      })
      .then(result => {
        if (result.success) {
          // 模拟流式输出
          this.simulateStreamOutput(result.response)
        } else {
          throw new Error(result.error || '识别失败')
        }
      })
      .catch(error => {
        console.error('识别失败:', error)
        wx.showToast({
          title: '识别失败，请重试',
          icon: 'none'
        })
        this.setData({ 
          isAnalyzing: false,
          streamResponse: '识别失败，请重试'
        })
      })
  },

  // 图片转base64
  imageToBase64(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: imagePath,
        encoding: 'base64',
        success: res => resolve(res.data),
        fail: err => reject(err)
      })
    })
  },

  // 添加字体控制方法
  increaseFont() {
    if (this.data.fontSize < 60) {
      this.setData({
        fontSize: this.data.fontSize + 4
      })
    }
  },

  decreaseFont() {
    if (this.data.fontSize > 28) {
      this.setData({
        fontSize: this.data.fontSize - 4
      })
    }
  },

  // 修改解析结果的方法
  parseResult(text) {
    console.log('原始返回文本:', text)
    
    const sections = {
      basicInfo: '',
      usage: '',
      notices: ''
    }

    try {
      // 尝试解析返回的文本
      const lines = text.split('\n')
      let currentSection = null
      let sectionContent = []

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // 跳过空行
        if (!trimmedLine) continue

        // 判断section
        if (trimmedLine.includes('1. 产品基本信息')) {
          currentSection = 'basicInfo'
          continue
        } else if (trimmedLine.includes('2. 使用方法')) {
          if (currentSection === 'basicInfo') {
            sections.basicInfo = sectionContent.join('\n')
          }
          sectionContent = []
          currentSection = 'usage'
          continue
        } else if (trimmedLine.includes('3. 注意事项')) {
          if (currentSection === 'usage') {
            sections.usage = sectionContent.join('\n')
          }
          sectionContent = []
          currentSection = 'notices'
          continue
        }

        // 收集当前section的内容
        if (currentSection && trimmedLine) {
          // 如果是列表项，确保格式正确
          if (trimmedLine.startsWith('-')) {
            sectionContent.push(trimmedLine)
          } else if (trimmedLine.startsWith('•')) {
            sectionContent.push('- ' + trimmedLine.substring(1).trim())
          } else {
            sectionContent.push(trimmedLine)
          }
        }
      }

      // 处理最后一个section
      if (currentSection === 'notices' && sectionContent.length > 0) {
        sections.notices = sectionContent.join('\n')
      }

      // 检查并格式化每个部分
      Object.keys(sections).forEach(key => {
        if (!sections[key]) {
          sections[key] = '暂无相关信息'
        }
      })

      console.log('解析后的结果:', sections)
      return sections

    } catch (error) {
      console.error('解析结果时出错:', error)
      return {
        basicInfo: '解析失败，请重试',
        usage: '解析失败，请重试',
        notices: '解析失败，请重试'
      }
    }
  },

  // 添加触摸移动处理
  onTouchMove(e) {
    const pupils = document.querySelectorAll('.pupil')
    const eyes = document.querySelectorAll('.eye')
    
    eyes.forEach((eye, index) => {
      const rect = eye.getBoundingClientRect()
      const eyeCenterX = rect.left + rect.width / 2
      const eyeCenterY = rect.top + rect.height / 2
      
      const angle = Math.atan2(e.touches[0].clientY - eyeCenterY, e.touches[0].clientX - eyeCenterX)
      const distance = Math.min(rect.width / 6, Math.hypot(e.touches[0].clientX - eyeCenterX, e.touches[0].clientY - eyeCenterY) / 5)
      
      const pupil = pupils[index]
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      
      pupil.style.transform = `translate(${x}px, ${y}px)`
    })
  },

  // 模拟流式输出
  simulateStreamOutput(text) {
    let index = 0
    const speed = 50  // 每个字的延迟时间（毫秒）
    
    const timer = setInterval(() => {
      if (index < text.length) {
        this.setData({
          streamResponse: text.substring(0, index + 1)
        })
        index++
      } else {
        clearInterval(timer)
        this.setData({ isAnalyzing: false })
      }
    }, speed)
  }
})
