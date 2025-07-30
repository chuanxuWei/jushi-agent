import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmotionScoreInput } from '../EmotionScoreInput'

describe('EmotionScoreInput', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('应该渲染情绪评分输入界面', () => {
    render(<EmotionScoreInput onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText('请评估一下你现在的状态（1-10分）')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByText('5分')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument()
  })

  it('应该允许用户通过滑动条调整情绪评分', async () => {
    const user = userEvent.setup()
    render(<EmotionScoreInput onSubmit={mockOnSubmit} />)
    
    const slider = screen.getByRole('slider')
    
    // 模拟滑动到评分8
    fireEvent.change(slider, { target: { value: '8' } })
    
    expect(screen.getByText('8分')).toBeInTheDocument()
  })

  it('应该根据评分显示对应的情绪标签', async () => {
    render(<EmotionScoreInput onSubmit={mockOnSubmit} />)
    
    const slider = screen.getByRole('slider')
    
    // 测试重度焦虑标签 (1-3分)
    fireEvent.change(slider, { target: { value: '2' } })
    expect(screen.getByText('完全无法动手')).toBeInTheDocument()
    expect(screen.getByText('频繁自我否定')).toBeInTheDocument()
    
    // 测试中度焦虑标签 (4-6分)
    fireEvent.change(slider, { target: { value: '5' } })
    expect(screen.getByText('犹豫拖延')).toBeInTheDocument()
    expect(screen.getByText('担心做不好')).toBeInTheDocument()
    
    // 测试状态良好标签 (7-10分)
    fireEvent.change(slider, { target: { value: '8' } })
    expect(screen.getByText('有行动力')).toBeInTheDocument()
    expect(screen.getByText('明确目标')).toBeInTheDocument()
  })

  it('应该允许用户选择多个情绪标签', async () => {
    const user = userEvent.setup()
    render(<EmotionScoreInput onSubmit={mockOnSubmit} />)
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '3' } })
    
    // 选择第一个标签
    const tag1 = screen.getByText('完全无法动手')
    await user.click(tag1)
    expect(tag1).toHaveClass('selected')
    
    // 选择第二个标签
    const tag2 = screen.getByText('频繁自我否定')
    await user.click(tag2)
    expect(tag2).toHaveClass('selected')
    
    // 取消选择第一个标签
    await user.click(tag1)
    expect(tag1).not.toHaveClass('selected')
    expect(tag2).toHaveClass('selected')
  })

  it('应该在用户点击确定时调用onSubmit回调', async () => {
    const user = userEvent.setup()
    render(<EmotionScoreInput onSubmit={mockOnSubmit} />)
    
    const slider = screen.getByRole('slider')
    const submitButton = screen.getByRole('button', { name: '确定' })
    
    // 调整评分到7
    fireEvent.change(slider, { target: { value: '7' } })
    
    // 点击确定
    await user.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalledWith(7)
  })

  it('应该有良好的键盘可访问性', async () => {
    const user = userEvent.setup()
    render(<EmotionScoreInput onSubmit={mockOnSubmit} />)
    
    const slider = screen.getByRole('slider')
    
    // 使用键盘调整滑动条
    slider.focus()
    await user.keyboard('{ArrowRight}')
    
    expect(screen.getByText('6分')).toBeInTheDocument()
    
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByText('4分')).toBeInTheDocument()
  })

  it('应该支持建议评分的预设功能', () => {
    render(<EmotionScoreInput onSubmit={mockOnSubmit} suggestedScore={3} />)
    
    // 应该显示建议的评分
    expect(screen.getByText('3分')).toBeInTheDocument()
    
    // 应该显示对应的标签组
    expect(screen.getByText('完全无法动手')).toBeInTheDocument()
  })

  it('应该在评分变化时提供即时反馈', () => {
    render(<EmotionScoreInput onSubmit={mockOnSubmit} />)
    
    const slider = screen.getByRole('slider')
    
    // 测试不同评分的反馈文本
    fireEvent.change(slider, { target: { value: '2' } })
    expect(screen.getByText(/重度焦虑/)).toBeInTheDocument()
    
    fireEvent.change(slider, { target: { value: '5' } })
    expect(screen.getByText(/中度焦虑/)).toBeInTheDocument()
    
    fireEvent.change(slider, { target: { value: '9' } })
    expect(screen.getByText(/状态良好/)).toBeInTheDocument()
  })
}) 