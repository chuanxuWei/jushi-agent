import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 检查环境变量
    const apiKey = process.env.SILICONFLOW_API_KEY
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const nodeEnv = process.env.NODE_ENV
    
    // 测试API连接
    let apiTestResult = '未测试'
    if (apiKey) {
      try {
        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'Qwen/Qwen2.5-72B-Instruct',
            messages: [{ role: 'user', content: '测试连接' }],
            max_tokens: 10,
            temperature: 0.7
          })
        })
        
        if (response.ok) {
          apiTestResult = '✅ API连接成功'
        } else {
          apiTestResult = `❌ API响应错误: ${response.status} ${response.statusText}`
        }
      } catch (error) {
        apiTestResult = `❌ API请求失败: ${error instanceof Error ? error.message : String(error)}`
      }
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: nodeEnv,
        NEXTAUTH_URL: nextAuthUrl,
        SILICONFLOW_API_KEY: apiKey ? `${apiKey.substring(0, 10)}...` : '未配置',
        hasApiKey: !!apiKey,
        apiTest: apiTestResult
      },
      vercel: {
        region: process.env.VERCEL_REGION || '未知',
        url: process.env.VERCEL_URL || '未知',
        env: process.env.VERCEL_ENV || '未知'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 