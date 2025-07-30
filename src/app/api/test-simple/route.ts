import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('简化测试API被调用')
    
    const body = await request.json()
    console.log('收到的数据:', body)
    
    // 直接返回成功响应，不调用任何外部API
    return NextResponse.json({
      success: true,
      data: {
        response: '这是一个测试回复，用于验证基本功能是否正常',
        emotionScore: 7,
        emotionTags: ['test'],
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('简化测试API错误:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: `测试API错误: ${error instanceof Error ? error.message : String(error)}`
      }
    }, { status: 500 })
  }
}
