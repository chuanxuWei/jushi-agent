import { NextRequest, NextResponse } from 'next/server'
import { EmotionAnalyzer } from '@/lib/ai/emotion-analyzer'
import { ChatGenerator } from '@/lib/ai/chat-generator'
import { TaskDecomposer } from '@/lib/task/decomposer'
import { APIResponse, ChatRequest, ChatResponse } from '@/types'

const emotionAnalyzer = new EmotionAnalyzer()
const chatGenerator = new ChatGenerator()
const taskDecomposer = new TaskDecomposer()

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, taskId } = body

    console.log('Chat API: 收到消息:', { message, taskId })

    // 1. 分析情绪
    const emotionAnalysis = await emotionAnalyzer.analyzeEmotion(message)
    console.log('情绪分析结果:', emotionAnalysis)
    
    // 2. 生成AI回复 - 使用真实的AI服务
    const aiResponse = await chatGenerator.generateResponse(
      message, 
      emotionAnalysis.score, 
      emotionAnalysis.tags
    )
    
    // 3. 检测是否需要任务拆解
    const needsTaskDecomposition = containsTaskKeywords(message)
    
    // 4. 构建响应
    const response: APIResponse<ChatResponse> = {
      success: true,
      data: {
        response: aiResponse,
        emotionScore: emotionAnalysis.score,
        emotionTags: emotionAnalysis.tags,
        needsEmotionInput: emotionAnalysis.score <= 6, // 中度以下焦虑需要确认
        suggestedActions: needsTaskDecomposition ? ['task_decomposition'] : undefined
      },
      timestamp: new Date().toISOString()
    }

    console.log('Chat API: 响应生成成功')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Chat API Error:', error)
    
    const errorResponse: APIResponse<ChatResponse> = {
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: '抱歉，我现在遇到了一些技术问题。请稍后再试，或者描述一下您遇到的具体情况。',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// 检测是否包含任务相关关键词
function containsTaskKeywords(message: string): boolean {
  const taskKeywords = [
    '任务', '作业', '项目', '工作', '学习', '复习', '准备', '完成', 
    '写', '做', '学', '背', '记', '练习', '研究', '分析', '论文', '报告'
  ]
  
  return taskKeywords.some(keyword => message.includes(keyword))
} 