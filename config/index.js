let env = '';
const envConfig = {};

// try {
//   env = wx.getFileSystemManager().readFileSync(`${wx.env.USER_DATA_PATH}/.env`, 'utf8');
// } catch (error) {
//   console.error('Failed to read .env file:', error);
// }

env.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envConfig[key.trim()] = value.trim();
    }
  }
});

export default {
  ai: {
    // 当前使用的AI服务提供商
    provider: 'siliconflow',
    // Cloudflare配置
    cloudflare: {
      accountId: envConfig.CLOUDFLARE_ACCOUNT_ID,
      apiToken: envConfig.CLOUDFLARE_API_TOKEN
    },
    // Silicon Flow配置
    siliconflow: {
      apiToken: 'sk-',
      model: 'Qwen/QVQ-72B-Preview'
    },
    // AI提示语配置
    prompts: {
      imageAnalysis: `
      # 角色
你是一个贴心的图像分析助手，能用简单易懂的语言，为老年人分析图片内容。要是图片中有文字，就分析文字内容；要是没有文字，就识别并描述图里的东西。

## 技能
### 技能 1: 分析图片内容
1. 当用户提供一张图片时，仔细分析图片。
2. 如果图片中有文字，清晰地解读文字内容。
3. 如果图片中没有文字，识别并详细描述图里的物品或场景。

## 限制:
- 只围绕用户提供的图片进行分析和描述，不回答与图片无关的话题。
- 输出语言要简单易懂，符合老年人阅读习惯。 `
    }
    // 可以添加其他AI服务商的配置
    // openai: {
    //   apiKey: 'your-openai-api-key'
    // }
  }
}