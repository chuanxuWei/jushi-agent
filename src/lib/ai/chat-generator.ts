import { OpenAI } from 'openai'

export class ChatGenerator {
  private client: OpenAI | null = null

  constructor() {
    // 只有在有有效API密钥时才初始化客户端
    if (process.env.SILICONFLOW_API_KEY && process.env.SILICONFLOW_API_KEY !== 'test-api-key') {
      this.client = new OpenAI({
        apiKey: process.env.SILICONFLOW_API_KEY,
        baseURL: "https://api.siliconflow.cn/v1",
      })
      console.log('聊天生成器: API客户端初始化成功')
    } else {
      console.warn('聊天生成器: API密钥未配置，将使用模拟回复')
    }
  }

  async generateResponse(message: string, emotionScore: number, emotionTags: string[]): Promise<string> {
    // 如果没有配置有效的API密钥，返回模拟回复
    if (!this.client) {
      console.warn('API密钥未配置或无效，使用本地模板回复')
      return this.getLocalResponse(message, emotionScore)
    }

    try {
      // 根据情绪评分构建系统提示
      const systemPrompt = this.buildEnhancedSystemPrompt(emotionScore, emotionTags)
      
      const response = await this.client.chat.completions.create({
        model: 'Qwen/Qwen3-30B-A3B-Thinking-2507', // 使用硅基流动支持的Qwen模型
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 600,
        temperature: 0.6,
      })

      const aiResponse = response.choices[0]?.message?.content || '抱歉，我暂时无法生成回复。'
      console.log('AI回复生成成功:', aiResponse.substring(0, 100) + '...')
      return aiResponse

    } catch (error: any) {
      console.error('AI回复生成失败详情:', {
        error: error.message || error,
        stack: error.stack,
        apiKey: this.client ? '已配置' : '未配置',
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      })
      
      // 在生产环境中抛出错误而不是降级到模拟回复，这样可以看到真实的错误信息
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`API调用失败: ${error.message || error}`)
      }
      
      return this.getLocalResponse(message, emotionScore)
    }
  }

  private buildEnhancedSystemPrompt(emotionScore: number, emotionTags: string[]): string {
    const emotionContext = this.getEmotionContext(emotionScore)
    const tags = emotionTags.join('、')
    
    return `你是「聚时」AI助手，专门帮助大学生缓解焦虑并提供学习支持。

## 核心使命
- 提供有深度、有价值的专业建议
- 给出详细、结构化的解答
- 帮助用户真正理解和解决问题
- 展现专业知识和教学能力

## 回答质量要求
1. **深度和细节**：提供详细、深入的解释，避免敷衍
2. **结构化**：使用清晰的标题、步骤、要点组织内容
3. **实用性**：给出具体可行的建议和方法
4. **教学导向**：像优秀老师一样引导理解
5. **专业性**：展现扎实的专业知识，特别是计算机科学、数学、学习方法

## 当前用户状态
- 情绪评分：${emotionScore}/10
- 情绪标签：${tags}
- 情绪状态：${emotionContext}

## 回答策略
${this.getResponseStrategy(emotionScore)}

## 回答格式要求
- 使用markdown格式组织内容
- 包含清晰的标题和分点
- 提供具体示例和步骤
- 控制在400-500字，确保充实但简洁
- 语言亲切但专业，体现AI助手的专业能力

请基于以上要求，为用户提供高质量的专业回答。`
  }

  private getResponseStrategy(emotionScore: number): string {
    if (emotionScore <= 3) {
      return `用户情绪低落，需要：
- 温暖鼓励，建立信心
- 将复杂问题拆解为简单步骤
- 提供具体可执行的第一步
- 强调进步而非完美`
    } else if (emotionScore <= 6) {
      return `用户情绪中等，需要：
- 提供清晰的学习路径和方法
- 给出详细的知识解释和实例
- 帮助建立系统性理解
- 提供实用的学习技巧`
    } else {
      return `用户情绪较好，可以：
- 提供更深入的技术细节
- 拓展相关知识点
- 给出挑战性的思考问题
- 推荐进阶学习资源`
    }
  }

  private buildSystemPrompt(emotionScore: number, emotionTags: string[]): string {
    // 保留原有方法作为备用
    const emotionContext = this.getEmotionContext(emotionScore)
    const tags = emotionTags.join('、')
    
    return `你是聚时AI助手，专门帮助大学生缓解焦虑情绪并完成任务规划。

当前用户情绪状态：${emotionContext} (${emotionScore}/10)
情绪标签：${tags}

请根据用户的情绪状态提供个性化的回复和建议。回复要温暖、专业，并提供具体可行的帮助。
如果用户提到学习或任务相关内容，请提供详细的规划和建议。

回复要求：
- 语言温暖友好，展现专业能力
- 提供具体可行的建议
- 适当使用markdown格式
- 控制在200-400字`
  }

  private getEmotionContext(score: number): string {
    if (score <= 2) return '极度焦虑，需要immediate支持'
    if (score <= 4) return '高度焦虑，需要温和引导'
    if (score <= 6) return '中度焦虑，需要清晰指导'
    if (score <= 8) return '轻度焦虑，可以适度挑战'
    return '情绪良好，可以深入探讨'
  }

  private getLocalResponse(message: string, emotionScore: number): string {
    // 提升本地回复质量
    const responses = {
      high_anxiety: [
        "我能感受到你现在的压力。让我们一步一步来解决这个问题。首先，深吸一口气，我们可以把这个复杂的问题分解成几个简单的小步骤...",
        "感觉到焦虑是很正常的，特别是面对新的学习挑战时。让我帮你理清思路，制定一个循序渐进的学习计划..."
      ],
      medium_anxiety: [
        "我理解你的困惑。这个问题确实需要一些时间来消化。让我为你详细解释一下核心概念，并提供一些实用的学习方法...",
        "很好的问题！让我们深入分析一下这个概念的本质，我会用一些具体的例子来帮你理解..."
      ],
      low_anxiety: [
        "太好了！你提出了一个很有深度的问题。让我们来探讨一下这个概念的细节和它的实际应用...",
        "这是一个很棒的学习态度！让我为你提供一些进阶的思考角度和学习资源..."
      ]
    }

    let category = 'medium_anxiety'
    if (emotionScore <= 4) category = 'high_anxiety'
    else if (emotionScore >= 8) category = 'low_anxiety'

    const responseList = responses[category as keyof typeof responses]
    return responseList[Math.floor(Math.random() * responseList.length)]
  }
}