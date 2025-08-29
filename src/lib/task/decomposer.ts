import { SubTask, UserProfile, DecompositionStrategy } from '@/types'

export class TaskDecomposer {
  private apiKey: string
  private baseURL: string = 'https://api.siliconflow.cn/v1'

  constructor() {
    this.apiKey = process.env.SILICONFLOW_API_KEY || 'test-api-key'
  }

  getDecompositionStrategy(emotionScore: number): DecompositionStrategy {
    if (emotionScore <= 3) {
      return {
        type: 'atomic',
        maxDuration: 5,     // 最多5分钟
        complexity: 'minimal', // 最小复杂度
        guidance: 'step-by-step' // 逐步指导
      }
    } else if (emotionScore <= 6) {
      return {
        type: 'process-oriented',
        maxDuration: 25,    // 番茄钟时长
        complexity: 'moderate',
        guidance: 'structured' // 结构化指导
      }
    } else {
      return {
        type: 'goal-oriented',
        maxDuration: 60,    // 最多1小时
        complexity: 'flexible',
        guidance: 'framework' // 框架性指导
      }
    }
  }

  async decomposeTask(
    taskDescription: string,
    emotionScore: number,
    userProfile: UserProfile
  ): Promise<SubTask[]> {
    const prompt = this.buildDecompositionPrompt(emotionScore)
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen3-30B-A3B-Thinking-2507',
          messages: [{
            role: 'system',
            content: prompt
          }, {
            role: 'user',
            content: `任务：${taskDescription}\n情绪评分：${emotionScore}\n用户习惯：${JSON.stringify(userProfile.task_habits)}`
          }],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      const data = await response.json()
      
      try {
        const result = JSON.parse(data.choices[0].message.content)
        return result.subtasks.map((subtask: any, index: number) => ({
          id: '',
          task_id: '',
          title: subtask.title,
          description: subtask.description,
          order_index: subtask.order_index || index + 1,
          estimated_minutes: subtask.estimated_minutes,
          actual_minutes: undefined,
          status: 'pending' as const,
          emotion_score_when_created: emotionScore,
          created_at: new Date().toISOString(),
          completed_at: undefined
        }))
      } catch (parseError) {
        // 解析失败时返回默认子任务
        return [{
          id: '',
          task_id: '',
          title: '完成任务',
          description: '由于解析失败，请手动完成此任务',
          order_index: 1,
          estimated_minutes: 30,
          actual_minutes: undefined,
          status: 'pending' as const,
          emotion_score_when_created: emotionScore,
          created_at: new Date().toISOString(),
          completed_at: undefined
        }]
      }
    } catch (error) {
      throw error
    }
  }

  buildDecompositionPrompt(emotionScore: number): string {
    if (emotionScore <= 3) {
      return `将任务拆解为原子级步骤，每个步骤必须：
      1. 无需思考即可执行
      2. 耗时不超过5分钟
      3. 有明确的完成标准
      返回JSON格式的子任务列表，格式为：
      {
        "subtasks": [
          {
            "title": "步骤标题",
            "description": "详细描述",
            "estimated_minutes": 数字,
            "order_index": 数字
          }
        ]
      }`
    } else if (emotionScore <= 6) {
      return `将任务拆解为流程化步骤，每个步骤包含：
      1. 明确的时间预估
      2. 具体的成果物
      3. 循序渐进的逻辑
      返回JSON格式的子任务列表，格式为：
      {
        "subtasks": [
          {
            "title": "步骤标题",
            "description": "详细描述",
            "estimated_minutes": 数字,
            "order_index": 数字
          }
        ]
      }`
    } else {
      return `进行目标导向的任务拆解，保留用户自主性：
      1. 以结果倒推步骤
      2. 提供框架指导
      3. 允许个性化调整
      返回JSON格式的子任务列表，格式为：
      {
        "subtasks": [
          {
            "title": "步骤标题",
            "description": "详细描述",
            "estimated_minutes": 数字,
            "order_index": 数字
          }
        ]
      }`
    }
  }
}