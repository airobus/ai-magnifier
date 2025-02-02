// result.js
import AIServiceFactory from '../../utils/ai-service/index'
import config from '../../config/index'

Page({
  data: {
    imageUrl: '',
    messageBubbles: [],
    isAnalyzing: false,
    analyzingText: '识别中...',
    batteryLevelWidth: '0%',
    resultSections: {
      basicInfo: '',
      usage: '',
      notices: ''
    }
  },

  onLoad(options) {
    if (options.imageUrl) {
      const decodedImageUrl = decodeURIComponent(options.imageUrl)
      this.setData({ imageUrl: decodedImageUrl })
      // 初始化AI服务
      this.aiService = AIServiceFactory.getProvider(
        config.ai.provider,
        {
          ...config.ai[config.ai.provider],
          prompts: config.ai.prompts
        }
      )
      // 开始分析图片
      this.analyzeImage(decodedImageUrl)
    }
  },

  // 分析图片
  analyzeImage(imagePath) {
    this.setData({ 
      isAnalyzing: true,
      streamResponse: '',  // 清空之前的响应
      analyzingText: '识别中...'  // 添加分析状态文本
    })
    
    // 设置进度条初始样式
    this.setData({
      batteryLevelWidth: '0%'
    })

    // 启动进度条动画
    let progress = 0
    const progressTimer = setInterval(() => {
      if (progress < 90) { // 最多到90%，留出空间给最终完成
        progress += 1
        this.setData({
          batteryLevelWidth: progress + '%'
        })
      }
    }, 100) // 每100ms更新一次
    
    this.imageToBase64(imagePath)
      .then(imageData => {
        return this.aiService.analyzeImage(imageData)
      })
      .then(result => {
        if (result.success && result.response) {
          // 清除进度条定时器
          clearInterval(progressTimer)
          // 更新状态为识别完成，并设置进度条为 100%
          this.setData({
            analyzingText: '识别完成',
            batteryLevelWidth: '100%'
          })
          // 直接使用流式输出展示结果
          this.simulateStreamOutput(result.response)
        } else {
          clearInterval(progressTimer) // 确保清除定时器
          throw new Error(result.error || '识别失败')
        }
      })
      .catch(error => {
        clearInterval(progressTimer) // 确保清除定时器
        console.error('识别失败:', error)
        wx.showToast({
          title: '识别失败，请重试',
          icon: 'none'
        })
        this.setData({ 
          isAnalyzing: false,
          streamResponse: '识别失败，请重试',
          batteryLevelWidth: '0%' // 重置进度条
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

  // 模拟流式输出
  simulateStreamOutput(text) {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    let currentParagraphIndex = 0;
    let currentCharIndex = 0;
    const speed = 50;  // 每个字的延迟时间（毫秒）
    let messageBubbles = [];
    
    const timer = setInterval(() => {
      if (currentParagraphIndex < paragraphs.length) {
        const currentParagraph = paragraphs[currentParagraphIndex];
        
        if (currentCharIndex < currentParagraph.length) {
          // 更新当前段落的内容
          if (!messageBubbles[currentParagraphIndex]) {
            messageBubbles[currentParagraphIndex] = '';
          }
          messageBubbles[currentParagraphIndex] = currentParagraph.substring(0, currentCharIndex + 1);
          currentCharIndex++;
        } else {
          // 当前段落完成，移动到下一段
          currentParagraphIndex++;
          currentCharIndex = 0;
        }
        
        this.setData({ messageBubbles });
      } else {
        clearInterval(timer);
        // 移除设置isAnalyzing为false的代码，保持进度条和结果显示
      }
    }, speed)
  },

  // 返回首页
  goBack() {
    wx.navigateBack()
  }
})