import { NextRequest, NextResponse } from 'next/server'
import { EmotionAnalyzer } from '@/lib/ai/emotion-analyzer'
import { ChatGenerator } from '@/lib/ai/chat-generator'
import { TaskDecomposer } from '@/lib/task/decomposer'
import { APIResponse, ChatRequest, ChatResponse } from '@/types'

const emotionAnalyzer = new EmotionAnalyzer()
const chatGenerator = new ChatGenerator()
const taskDecomposer = new TaskDecomposer()

// 添加 CORS 预检请求处理
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, taskId } = body

    // 输入验证
    if (!message || typeof message !== 'string') {
      throw new Error('消息内容无效')
    }
    
    if (message.length > 1000) {
      throw new Error('消息内容过长，请缩短到1000字符以内')
    }

    // 清理输入
    const cleanMessage = message.trim()
    if (!cleanMessage) {
      throw new Error('消息内容不能为空')
    }

    console.log('Chat API: 收到消息:', { 
      message: cleanMessage.substring(0, 100), 
      taskId, 
      messageLength: cleanMessage.length,
      timestamp: new Date().toISOString()
    })

    // 1. 分析情绪 - 添加错误处理
    console.log('开始情绪分析...')
    let emotionAnalysis
    try {
      emotionAnalysis = await emotionAnalyzer.analyzeEmotion(cleanMessage)
      console.log('情绪分析结果:', emotionAnalysis)
    } catch (error) {
      console.error('情绪分析失败:', error)
      // 使用默认值继续
      emotionAnalysis = { score: 7, tags: ['neutral'], reasoning: '分析失败，使用默认值' }
    }
    
    // 2. 生成AI回复 - 添加错误处理
    console.log('开始生成AI回复...')
    let aiResponse
    try {
      aiResponse = await chatGenerator.generateResponse(
        cleanMessage, 
        emotionAnalysis.score, 
        emotionAnalysis.tags
      )
      console.log('AI回复生成完成，长度:', aiResponse.length)
    } catch (error) {
      console.error('AI回复生成失败:', error)
      throw error // 重新抛出以触发外层错误处理
    }
    
    // 3. 检测是否需要任务拆解
    const needsTaskDecomposition = containsTaskKeywords(cleanMessage)
    
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
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
    
  } catch (error) {
    console.error('Chat API Error详情:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
    
    const errorResponse: APIResponse<ChatResponse> = {
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: '抱歉，我现在遇到了一些技术问题。请稍后再试，或者描述一下您遇到的具体情况。',
        details: process.env.NODE_ENV === 'development' ? String(error) : 
                 `Error: ${error instanceof Error ? error.message : String(error)}`
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
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