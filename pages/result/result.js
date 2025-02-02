// result.js
import AIServiceFactory from '../../utils/ai-service/index'
import config from '../../config/index'

Page({
  data: {
    imageUrl: '',
    messageBubbles: [],
    isAnalyzing: false,
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
      streamResponse: ''  // 清空之前的响应
    })
    
    this.imageToBase64(imagePath)
      .then(imageData => {
        return this.aiService.analyzeImage(imageData)
      })
      .then(result => {
        if (result.success && result.response) {
          // 直接使用流式输出展示结果
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

  // 解析AI返回的结果
  parseResult(text) {
    console.log('原始返回文本:', text)
    
    const sections = {
      usage: '',
      notices: ''
    }

    try {
      const lines = text.split('\n')
      let currentSection = null
      let sectionContent = []

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        if (!trimmedLine) continue

        if (trimmedLine.includes('2. 使用方法')) {
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

        if (currentSection && trimmedLine) {
          sectionContent.push(trimmedLine)
        }
      }

      if (currentSection === 'notices' && sectionContent.length > 0) {
        sections.notices = sectionContent.join('\n')
      }

      Object.keys(sections).forEach(key => {
        if (!sections[key]) {
          sections[key] = '暂无相关信息'
        }
      })

      return sections

    } catch (error) {
      console.error('解析结果时出错:', error)
      return {
        usage: '解析失败，请重试',
        notices: '解析失败，请重试'
      }
    }
  },

  // 返回首页
  goBack() {
    wx.navigateBack()
  }
})