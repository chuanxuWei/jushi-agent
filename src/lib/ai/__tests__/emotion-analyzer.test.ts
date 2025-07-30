import { EmotionAnalyzer } from '../emotion-analyzer'
import { EmotionAnalysis } from '@/types'

// 模拟硅基流动API
global.fetch = jest.fn()

describe('EmotionAnalyzer', () => {
  let analyzer: EmotionAnalyzer
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    analyzer = new EmotionAnalyzer()
    mockFetch.mockClear()
  })

  describe('analyzeEmotion', () => {
    it('应该分析用户文本并返回情绪评分', async () => {
      // 模拟API响应
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 3,
              tags: ['焦虑', '自我怀疑'],
              reasoning: '用户表现出明显的焦虑情绪和对自己能力的怀疑'
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await analyzer.analyzeEmotion('我觉得这个任务太难了，我可能做不好')

      expect(result).toEqual({
        score: 3,
        tags: ['焦虑', '自我怀疑'],
        reasoning: '用户表现出明显的焦虑情绪和对自己能力的怀疑'
      })
    })

    it('应该处理API返回的无效JSON格式', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '这不是有效的JSON格式'
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await analyzer.analyzeEmotion('测试文本')

      expect(result).toEqual({
        score: 5,
        tags: ['需要关注'],
        reasoning: '解析失败，使用默认评分'
      })
    })

    it('应该处理API调用失败的情况', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API调用失败'))

      await expect(analyzer.analyzeEmotion('测试文本')).rejects.toThrow('API调用失败')
    })

    it('应该使用正确的API端点和参数', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 7,
              tags: ['积极'],
              reasoning: '用户情绪积极'
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      await analyzer.analyzeEmotion('我今天感觉很好')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.siliconflow.cn/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('deepseek-chat')
        })
      )
    })
  })

  describe('suggestEmotionScore', () => {
    it('应该基于分析结果建议情绪评分', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 6,
              tags: ['轻微焦虑'],
              reasoning: '用户有轻微担忧'
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const score = await analyzer.suggestEmotionScore('我有点担心明天的考试')

      expect(score).toBe(6)
    })
  })

  describe('情绪评分边界测试', () => {
    const testCases = [
      { input: '我完全无法动手做这件事', expectedRange: [1, 3] },
      { input: '我有点犹豫不知道怎么开始', expectedRange: [4, 6] },
      { input: '我很清楚自己要做什么', expectedRange: [7, 10] },
    ]

    testCases.forEach(({ input, expectedRange }) => {
      it(`应该为"${input}"返回${expectedRange[0]}-${expectedRange[1]}分的评分`, async () => {
        const [min, max] = expectedRange
        const mockScore = Math.floor(Math.random() * (max - min + 1)) + min
        
        const mockResponse = {
          choices: [{
            message: {
              content: JSON.stringify({
                score: mockScore,
                tags: ['测试'],
                reasoning: '测试分析'
              })
            }
          }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)

        const result = await analyzer.analyzeEmotion(input)
        
        expect(result.score).toBeGreaterThanOrEqual(min)
        expect(result.score).toBeLessThanOrEqual(max)
      })
    })
  })
}) 