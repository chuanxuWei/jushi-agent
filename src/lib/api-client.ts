// API 客户端工具 - 处理网络请求的兼容性和错误处理
interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  timestamp: string
}

/**
 * 增强的 fetch 函数，支持超时、重试和跨设备兼容性
 */
export async function enhancedFetch<T = any>(
  url: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = 30000, // 30秒超时
    retries = 3,
    retryDelay = 1000
  } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`API请求尝试 ${attempt + 1}/${retries + 1}:`, { url, method: options.method })

      const response = await fetch(url, fetchOptions)
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API请求成功:', { url, success: data.success })
      
      return data
    } catch (error) {
      lastError = error as Error
      console.warn(`API请求失败 (尝试 ${attempt + 1}):`, {
        url,
        error: lastError.message,
        isAbortError: lastError.name === 'AbortError',
        isNetworkError: !navigator.onLine
      })

      // 如果是最后一次尝试，不再重试
      if (attempt === retries) {
        break
      }

      // 检查是否是网络错误，如果是则增加延迟
      const delay = lastError.name === 'AbortError' ? retryDelay * 2 : retryDelay
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))
    }
  }

  clearTimeout(timeoutId)

  // 生成友好的错误信息
  let errorMessage = '网络请求失败，请检查网络连接'
  let errorCode = 'NETWORK_ERROR'

  if (lastError) {
    if (lastError.name === 'AbortError') {
      errorMessage = '请求超时，请稍后重试'
      errorCode = 'TIMEOUT_ERROR'
    } else if (lastError.message.includes('Failed to fetch')) {
      errorMessage = '无法连接到服务器，请检查网络连接'
      errorCode = 'CONNECTION_ERROR'
    } else if (lastError.message.includes('HTTP')) {
      errorMessage = '服务器响应错误，请稍后重试'
      errorCode = 'SERVER_ERROR'
    }
  }

  return {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? lastError?.message : undefined
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * 聊天 API 请求
 */
export async function sendChatMessage(message: string, taskId?: string) {
  return enhancedFetch<{
    response: string
    emotionScore: number
    emotionTags: string[]
    needsEmotionInput: boolean
    suggestedActions?: string[]
  }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, taskId })
  }, {
    timeout: 45000, // 聊天请求可能需要更长时间
    retries: 2,
    retryDelay: 2000
  })
}

/**
 * 健康检查 API 请求
 */
export async function checkHealth() {
  return enhancedFetch('/api/health', {
    method: 'GET'
  }, {
    timeout: 10000,
    retries: 1,
    retryDelay: 1000
  })
}