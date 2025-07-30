'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { EmotionScoreInput } from './EmotionScoreInput'
import { MessageBubble } from './MessageBubble'
import { Message } from '@/types'
import { generateId } from '@/lib/utils'
import { Send, Trash2, Sparkles, MessageCircle, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect as useEffectTheme, useState as useStateTheme } from 'react'

interface ChatInterfaceProps {
  initialMessages?: Message[]
  onTaskCreate?: (task: any) => void
  onEmotionUpdate?: (score: number) => void
}

export function ChatInterface({ 
  initialMessages = [], 
  onTaskCreate, 
  onEmotionUpdate 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmotionInput, setShowEmotionInput] = useState(false)
  const [suggestedEmotionScore, setSuggestedEmotionScore] = useState<number | undefined>()
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useStateTheme(false)

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  useEffectTheme(() => {
    setMounted(true)
  }, [])

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="w-4 h-4" />
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />
      case 'dark': return <Moon className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const toggleTheme = () => {
    if (!mounted) return
    const themes = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme || 'system')
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      user_id: 'current-user', // TODO: 从认证系统获取
      role: 'user',
      content: input.trim(),
      task_id: currentTaskId,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // 重置textarea高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      console.log('发送聊天请求:', { 
        message: userMessage.content.substring(0, 50),
        taskId: currentTaskId,
        timestamp: new Date().toISOString()
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          taskId: currentTaskId
        })
      })

      if (!response.ok) {
        console.error('API响应错误:', { 
          status: response.status, 
          statusText: response.statusText 
        })
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API响应成功:', { 
        success: data.success, 
        hasResponse: !!data.data?.response 
      })

      if (data.success) {
        const assistantMessage: Message = {
          id: generateId(),
          user_id: 'current-user',
          role: 'assistant',
          content: data.data.response,
          task_id: currentTaskId,
          emotion_score: data.data.emotionScore,
          created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantMessage])

        // 如果需要情绪输入
        if (data.data.needsEmotionInput || data.data.emotionScore <= 6) {
          setShowEmotionInput(true)
          setSuggestedEmotionScore(data.data.emotionScore)
        }

        // 如果创建了新任务
        if (data.data.task) {
          onTaskCreate?.(data.data.task)
          setCurrentTaskId(data.data.task.id)
        }
      } else {
        throw new Error(data.error?.message || '未知错误')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        user_id: 'current-user',
        role: 'assistant',
        content: `抱歉，发生了一些错误：${error instanceof Error ? error.message : '请稍后重试'}`,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmotionSubmit = (score: number) => {
    setShowEmotionInput(false)
    onEmotionUpdate?.(score)
    
    // 可以在这里触发基于情绪评分的任务拆解
    if (currentTaskId) {
      // TODO: 调用任务拆解API
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setCurrentTaskId(undefined)
    setShowEmotionInput(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="chat-interface">
      {/* 聊天头部 */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                聚时智能助手
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                情绪感知 · 任务拆解 · 智能陪伴
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleTheme}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {getThemeIcon()}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearChat}
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
              disabled={isEmpty}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空对话
            </Button>
          </div>
        </div>
      </div>

      {/* 消息容器 */}
      <div className="messages-container">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                开始对话
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                告诉我你现在的任务或感受，我会根据你的情绪状态提供个性化的帮助和任务拆解建议
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                情绪感知
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                任务拆解
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                智能陪伴
              </span>
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                onTaskCreate={onTaskCreate}
              />
            ))}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-slide-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="typing-indicator">
                  <span className="text-sm text-gray-600 dark:text-gray-300">AI正在思考</span>
                  <div className="flex gap-1">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 情绪输入区域 */}
      {showEmotionInput && (
        <div className="emotion-input-container">
          <EmotionScoreInput 
            onSubmit={handleEmotionSubmit}
            suggestedScore={suggestedEmotionScore}
          />
        </div>
      )}

      {/* 输入区域 */}
      <div className="input-form">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="告诉我你现在的任务或感受..."
            className="input-textarea"
            disabled={isLoading}
            rows={1}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            <Send className="w-4 h-4" />
            发送
          </button>
        </div>
      </div>
    </div>
  )
} 