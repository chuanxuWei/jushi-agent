'use client'

import { Message } from '@/types'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Copy, Check, User, Bot, Brain } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'

interface MessageBubbleProps {
  message: Message
  onTaskCreate?: (task: any) => void
}

export function MessageBubble({ message, onTaskCreate }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { theme } = useTheme()
  
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const getEmotionColor = (score?: number) => {
    if (!score) return ''
    if (score <= 3) return 'text-red-500'
    if (score <= 6) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getEmotionLabel = (score?: number) => {
    if (!score) return ''
    if (score <= 3) return '重度焦虑'
    if (score <= 6) return '中度焦虑'
    return '状态良好'
  }
  
  return (
    <div className={cn(
      "group flex gap-3 max-w-[85%] animate-in slide-in-from-bottom-1 duration-300",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* 头像 */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md",
        isUser 
          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" 
          : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* 消息内容 */}
      <div className={cn(
        "flex flex-col gap-2 min-w-0 flex-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* 消息气泡 */}
        <div className={cn(
          "relative rounded-2xl px-4 py-3 shadow-sm border max-w-full",
          "transition-all duration-200 hover:shadow-md",
          isUser 
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md" 
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-md border-gray-200 dark:border-gray-700"
        )}>
          {/* Markdown 渲染 */}
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser 
              ? "prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:text-blue-100 prose-code:bg-blue-600/30"
              : "prose-gray dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-gray-100"
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  const codeString = String(children).replace(/\n$/, '')
                  const inline = !language
                  
                  if (!inline && language) {
                    return (
                      <div className="relative group/code">
                        <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 text-xs rounded-t-lg">
                          <span className="font-medium">{language}</span>
                          <button
                            onClick={() => handleCopyCode(codeString)}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            {copiedCode === codeString ? (
                              <>
                                <Check size={12} />
                                <span>已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>复制</span>
                              </>
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={theme === 'dark' ? oneDark : oneLight}
                          language={language}
                          PreTag="div"
                          className="!mt-0 !rounded-t-none"
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }
                  
                  return (
                    <code 
                      className={cn(
                        "px-1.5 py-0.5 rounded text-sm font-mono",
                        isUser 
                          ? "bg-blue-600/30 text-blue-100" 
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                blockquote: ({ children }: any) => (
                  <blockquote className={cn(
                    "border-l-4 pl-4 py-2 my-2 italic",
                    isUser 
                      ? "border-blue-300 text-blue-100" 
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                  )}>
                    {children}
                  </blockquote>
                ),
                ul: ({ children }: any) => (
                  <ul className="list-disc list-inside space-y-1 my-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }: any) => (
                  <ol className="list-decimal list-inside space-y-1 my-2">
                    {children}
                  </ol>
                ),
                table: ({ children }: any) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }: any) => (
                  <th className={cn(
                    "border border-gray-300 dark:border-gray-600 px-3 py-2 font-semibold text-left",
                    isUser 
                      ? "bg-blue-600/20 text-white" 
                      : "bg-gray-50 dark:bg-gray-700"
                  )}>
                    {children}
                  </th>
                ),
                td: ({ children }: any) => (
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                    {children}
                  </td>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* 元信息 */}
        <div className={cn(
          "flex items-center gap-2 text-xs",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* 时间戳 */}
          <span className="text-gray-500 dark:text-gray-400">
            {formatTime(message.created_at)}
          </span>
          
          {/* 情绪评分 */}
          {message.emotion_score && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            )}>
              <Brain size={12} className={getEmotionColor(message.emotion_score)} />
              <span className={getEmotionColor(message.emotion_score)}>
                {getEmotionLabel(message.emotion_score)} ({message.emotion_score}/10)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 