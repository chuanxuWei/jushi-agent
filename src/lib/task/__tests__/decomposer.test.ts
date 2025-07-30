import { TaskDecomposer } from '../decomposer'
import { UserProfile, SubTask, DecompositionStrategy } from '@/types'

// 模拟硅基流动API
global.fetch = jest.fn()

describe('TaskDecomposer', () => {
  let decomposer: TaskDecomposer
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  const mockUserProfile: UserProfile = {
    id: '1',
    user_id: '1',
    high_efficiency_hours: ['09:00-11:00', '20:00-22:00'],
    anxiety_triggers: ['deadline_pressure'],
    motivation_preference: 'positive_encouragement',
    task_habits: {
      pomodoro_duration: 25,
      break_preference: 5,
      max_daily_tasks: 5
    },
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }

  beforeEach(() => {
    decomposer = new TaskDecomposer()
    mockFetch.mockClear()
  })

  describe('getDecompositionStrategy', () => {
    it('应该为重度焦虑(1-3分)返回原子级策略', () => {
      const strategy = decomposer.getDecompositionStrategy(2)
      
      expect(strategy).toEqual({
        type: 'atomic',
        maxDuration: 5,
        complexity: 'minimal',
        guidance: 'step-by-step'
      })
    })

    it('应该为中度焦虑(4-6分)返回流程化策略', () => {
      const strategy = decomposer.getDecompositionStrategy(5)
      
      expect(strategy).toEqual({
        type: 'process-oriented',
        maxDuration: 25,
        complexity: 'moderate',
        guidance: 'structured'
      })
    })

    it('应该为状态良好(7-10分)返回目标导向策略', () => {
      const strategy = decomposer.getDecompositionStrategy(8)
      
      expect(strategy).toEqual({
        type: 'goal-oriented',
        maxDuration: 60,
        complexity: 'flexible',
        guidance: 'framework'
      })
    })
  })

  describe('decomposeTask', () => {
    it('应该根据情绪评分拆解任务为子任务', async () => {
      const mockSubtasks = [
        {
          title: '创建新文档',
          description: '打开Word并创建新文档',
          estimated_minutes: 2,
          order_index: 1
        },
        {
          title: '写第一段',
          description: '写下开头段落',
          estimated_minutes: 10,
          order_index: 2
        }
      ]

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              subtasks: mockSubtasks,
              strategy: 'atomic'
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await decomposer.decomposeTask(
        '写一份作业报告',
        3, // 重度焦虑
        mockUserProfile
      )

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('创建新文档')
      expect(result[0].estimated_minutes).toBe(2)
      expect(result[1].order_index).toBe(2)
    })

    it('应该为不同情绪评分生成不同粒度的子任务', async () => {
      // 重度焦虑的拆解 - 应该更细致
      const atomicResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              subtasks: [
                { title: '打开电脑', estimated_minutes: 1, order_index: 1 },
                { title: '打开浏览器', estimated_minutes: 1, order_index: 2 },
                { title: '搜索资料', estimated_minutes: 5, order_index: 3 }
              ]
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(atomicResponse),
      } as Response)

      const atomicResult = await decomposer.decomposeTask(
        '研究一个主题',
        2, // 重度焦虑
        mockUserProfile
      )

      expect(atomicResult.every(task => task.estimated_minutes <= 5)).toBe(true)

      // 状态良好的拆解 - 可以更粗略
      const goalOrientedResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              subtasks: [
                { title: '制定研究计划', estimated_minutes: 30, order_index: 1 },
                { title: '收集和分析资料', estimated_minutes: 60, order_index: 2 }
              ]
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(goalOrientedResponse),
      } as Response)

      const goalOrientedResult = await decomposer.decomposeTask(
        '研究一个主题',
        9, // 状态良好
        mockUserProfile
      )

      expect(goalOrientedResult.some(task => task.estimated_minutes > 25)).toBe(true)
    })

    it('应该处理API调用失败', async () => {
      mockFetch.mockRejectedValueOnce(new Error('网络错误'))

      await expect(
        decomposer.decomposeTask('测试任务', 5, mockUserProfile)
      ).rejects.toThrow('网络错误')
    })

    it('应该处理无效的JSON响应', async () => {
      const invalidResponse = {
        choices: [{
          message: {
            content: '无效的JSON'
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(invalidResponse),
      } as Response)

      const result = await decomposer.decomposeTask(
        '测试任务',
        5,
        mockUserProfile
      )

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('完成任务')
      expect(result[0].description).toBe('由于解析失败，请手动完成此任务')
    })
  })

  describe('buildDecompositionPrompt', () => {
    it('应该为重度焦虑构建原子级拆解提示', () => {
      const prompt = decomposer.buildDecompositionPrompt(2)
      
      expect(prompt).toContain('原子级步骤')
      expect(prompt).toContain('5分钟')
      expect(prompt).toContain('无需思考即可执行')
    })

    it('应该为中度焦虑构建流程化拆解提示', () => {
      const prompt = decomposer.buildDecompositionPrompt(5)
      
      expect(prompt).toContain('流程化步骤')
      expect(prompt).toContain('时间预估')
      expect(prompt).toContain('成果物')
    })

    it('应该为状态良好构建目标导向拆解提示', () => {
      const prompt = decomposer.buildDecompositionPrompt(8)
      
      expect(prompt).toContain('目标导向')
      expect(prompt).toContain('结果倒推')
      expect(prompt).toContain('框架指导')
    })
  })
}) 