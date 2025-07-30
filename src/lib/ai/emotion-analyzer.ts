import { OpenAI } from 'openai'
import { EmotionAnalysis } from '@/types'

export class EmotionAnalyzer {
  private client: OpenAI | null = null

  constructor() {
    // 只有在有有效API密钥时才初始化客户端
    if (process.env.SILICONFLOW_API_KEY && process.env.SILICONFLOW_API_KEY !== 'test-api-key') {
      this.client = new OpenAI({
        apiKey: process.env.SILICONFLOW_API_KEY,
        baseURL: "https://api.siliconflow.cn/v1",
      })
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    // 如果没有配置有效的API密钥，返回模拟结果
    if (!this.client) {
      console.warn('API密钥未配置或无效，使用模拟数据')
      return this.getMockEmotionAnalysis(text)
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'deepseek-ai/DeepSeek-V2.5',
        messages: [{
          role: 'system',
          content: `你是专业的情绪分析师。分析用户文本中的情绪状态，返回1-10分的评分和情绪标签。

评分标准：
1-3分：重度焦虑/抑郁
4-6分：中度焦虑/担忧
7-8分：轻度焦虑/一般
9-10分：积极/良好

请返回JSON格式：{"score": 数字, "tags": ["标签1", "标签2"], "reasoning": "简短分析原因"}

要求简洁准确，重点关注焦虑程度。`
        }, {
          role: 'user',
          content: `请分析这段文字的情绪：${text}`
        }],
        max_tokens: 150, // 大幅减少token使用
        temperature: 0.2, // 降低随机性，提高一致性和速度
      })

      const result = response.choices[0]?.message?.content?.trim()
      if (!result) {
        throw new Error('API返回空结果')
      }

      // 尝试解析JSON响应
      try {
        const emotionData = JSON.parse(result)
        const analysis: EmotionAnalysis = {
          score: Math.max(1, Math.min(10, emotionData.score || 5)),
          tags: Array.isArray(emotionData.tags) ? emotionData.tags : ['需要关注'],
          reasoning: emotionData.reasoning || 'AI分析完成'
        }
        
        console.log('情绪分析结果:', analysis)
        return analysis
      } catch (parseError) {
        console.warn('JSON解析失败，使用默认分析:', parseError)
        // 如果JSON解析失败，使用文本分析
        return this.parseTextualResponse(result, text)
      }

    } catch (error: any) {
      console.error('API调用失败，使用模拟数据:', error)
      return this.getMockEmotionAnalysis(text)
    }
  }

  private parseTextualResponse(response: string, originalText: string): EmotionAnalysis {
    // 从文本响应中提取信息
    const scoreMatch = response.match(/(\d+)分/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : this.estimateEmotionScore(originalText)
    
    return {
      score: Math.max(1, Math.min(10, score)),
      tags: ['需要关注'],
      reasoning: '解析失败，使用默认评分'
    }
  }

  private estimateEmotionScore(text: string): number {
    // 简化的关键词分析
    const anxietyKeywords = ['焦虑', '担心', '害怕', '紧张', '迷茫', '困惑', '难过', '沮丧', '压力']
    const positiveKeywords = ['开心', '高兴', '激动', '满意', '棒', '好的', '谢谢', '感谢']
    const neutralKeywords = ['学习', '问题', '如何', '怎么', '什么', '为什么']

    let score = 5 // 默认中性评分
    
    for (const keyword of anxietyKeywords) {
      if (text.includes(keyword)) {
        score = Math.max(2, score - 2)
        break
      }
    }
    
    for (const keyword of positiveKeywords) {
      if (text.includes(keyword)) {
        score = Math.min(9, score + 2)
        break
      }
    }

    return score
  }

  private getMockEmotionAnalysis(text: string): EmotionAnalysis {
    const score = this.estimateEmotionScore(text)
    
    let tags: string[] = []
    if (score <= 3) {
      tags = ['重度焦虑', '需要支持']
    } else if (score <= 6) {
      tags = ['中性情绪']
    } else {
      tags = ['积极状态', '有动力']
    }

    return {
      score,
      tags,
      reasoning: '基于文本关键词分析'
    }
  }

  async suggestEmotionScore(userInput: string): Promise<number> {
    // 基于用户输入建议情绪评分
    const analysis = await this.analyzeEmotion(userInput)
    return analysis.score
  }
} 