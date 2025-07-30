import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../ChatInterface'
import { Message } from '@/types'

// 模拟fetch API
global.fetch = jest.fn()

describe('ChatInterface', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('应该渲染对话界面', () => {
    render(<ChatInterface />)
    
    expect(screen.getByPlaceholderText('告诉我你现在的任务或感受...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '发送' })).toBeInTheDocument()
  })

  it('应该显示初始消息历史', () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        user_id: 'user1',
        role: 'user',
        content: '我需要写一份报告',
        created_at: '2024-01-01'
      },
      {
        id: '2',
        user_id: 'user1',
        role: 'assistant',
        content: '好的，让我帮你分析一下这个任务',
        created_at: '2024-01-01'
      }
    ]

    render(<ChatInterface initialMessages={initialMessages} />)
    
    expect(screen.getByText('我需要写一份报告')).toBeInTheDocument()
    expect(screen.getByText('好的，让我帮你分析一下这个任务')).toBeInTheDocument()
  })

  it('应该允许用户发送消息', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          response: 'AI回复内容',
          emotionScore: 5,
          emotionTags: ['中性']
        }
      }),
    } as Response)

    render(<ChatInterface />)
    
    const input = screen.getByPlaceholderText('告诉我你现在的任务或感受...')
    const sendButton = screen.getByRole('button', { name: '发送' })
    
    await user.type(input, '我感觉有点焦虑')
    await user.click(sendButton)
    
    // 验证用户消息显示
    expect(screen.getByText('我感觉有点焦虑')).toBeInTheDocument()
    
    // 等待AI回复
    await waitFor(() => {
      expect(screen.getByText('AI回复内容')).toBeInTheDocument()
    })
  })

  it('应该在发送时禁用输入和按钮', async () => {
    const user = userEvent.setup()
    
    // 模拟较慢的API响应
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { response: '回复', emotionScore: 5, emotionTags: [] }
          }),
        } as Response), 100)
      )
    )

    render(<ChatInterface />)
    
    const input = screen.getByPlaceholderText('告诉我你现在的任务或感受...')
    const sendButton = screen.getByRole('button', { name: '发送' })
    
    await user.type(input, '测试消息')
    await user.click(sendButton)
    
    // 发送中应该禁用
    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
    
    // 等待响应完成后恢复
    await waitFor(() => {
      expect(input).not.toBeDisabled()
      expect(sendButton).not.toBeDisabled()
    })
  })

  it('应该显示加载状态', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { response: '回复', emotionScore: 5, emotionTags: [] }
          }),
        } as Response), 100)
      )
    )

    render(<ChatInterface />)
    
    const input = screen.getByPlaceholderText('告诉我你现在的任务或感受...')
    const sendButton = screen.getByRole('button', { name: '发送' })
    
    await user.type(input, '测试消息')
    await user.click(sendButton)
    
    // 应该显示加载状态
    expect(screen.getByText('AI正在思考...')).toBeInTheDocument()
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByText('AI正在思考...')).not.toBeInTheDocument()
    })
  })

  it('应该处理API错误', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockRejectedValueOnce(new Error('网络错误'))

    render(<ChatInterface />)
    
    const input = screen.getByPlaceholderText('告诉我你现在的任务或感受...')
    const sendButton = screen.getByRole('button', { name: '发送' })
    
    await user.type(input, '测试消息')
    await user.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/抱歉，发生了一些错误/)).toBeInTheDocument()
    })
  })

  it('应该在收到情绪评分建议时显示情绪输入组件', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          response: 'AI回复内容',
          emotionScore: 3,
          emotionTags: ['焦虑'],
          needsEmotionInput: true
        }
      }),
    } as Response)

    render(<ChatInterface />)
    
    const input = screen.getByPlaceholderText('告诉我你现在的任务或感受...')
    const sendButton = screen.getByRole('button', { name: '发送' })
    
    await user.type(input, '我感觉压力很大')
    await user.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('请评估一下你现在的状态（1-10分）')).toBeInTheDocument()
    })
  })

  it('应该支持清空对话历史', async () => {
    const user = userEvent.setup()
    
    const initialMessages: Message[] = [
      {
        id: '1',
        user_id: 'user1',
        role: 'user',
        content: '测试消息',
        created_at: '2024-01-01'
      }
    ]

    render(<ChatInterface initialMessages={initialMessages} />)
    
    expect(screen.getByText('测试消息')).toBeInTheDocument()
    
    const clearButton = screen.getByRole('button', { name: '清空对话' })
    await user.click(clearButton)
    
    expect(screen.queryByText('测试消息')).not.toBeInTheDocument()
  })

  it('应该自动滚动到最新消息', async () => {
    const user = userEvent.setup()
    
    // 创建一个带有scrollIntoView的div元素
    const mockScrollIntoView = jest.fn()
    Element.prototype.scrollIntoView = mockScrollIntoView

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          response: 'AI回复内容',
          emotionScore: 5,
          emotionTags: []
        }
      }),
    } as Response)

    render(<ChatInterface />)
    
    const input = screen.getByPlaceholderText('告诉我你现在的任务或感受...')
    const sendButton = screen.getByRole('button', { name: '发送' })
    
    await user.type(input, '新消息')
    await user.click(sendButton)
    
    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalled()
    })
  })
}) 