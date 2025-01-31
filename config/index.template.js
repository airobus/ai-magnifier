export default {
  ai: {
    provider: 'cloudflare',
    cloudflare: {
      accountId: 'YOUR_ACCOUNT_ID',
      apiToken: 'YOUR_API_TOKEN'
    },
    prompts: {
      imageAnalysis: `请分析这张图片中的文字内容，并按以下格式输出：

1. 产品基本信息
   - 产品名称：
   - 主要用途：

2. 使用方法
   - 步骤1：
   - 步骤2：
   （如有更多步骤继续列出）

3. 注意事项
   - 重要提示1：
   - 重要提示2：
   （如有更多提示继续列出）

请用简单易懂的语言描述，适合老年人阅读。`
    }
  }
} 