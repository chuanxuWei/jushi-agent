// 用户相关类型
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// 用户画像类型
export interface UserProfile {
  id: string
  user_id: string
  high_efficiency_hours: string[]
  anxiety_triggers: string[]
  motivation_preference: 'positive_encouragement' | 'data_feedback'
  task_habits: {
    pomodoro_duration: number
    break_preference: number
    max_daily_tasks: number
  }
  created_at: string
  updated_at: string
}

// 情绪分析类型
export interface EmotionAnalysis {
  score: number // 1-10情绪评分
  tags: string[] // 情绪标签
  reasoning: string // 分析理由
}

// 情绪记录类型
export interface EmotionRecord {
  id: string
  user_id: string
  score: number
  emotion_tags: string[]
  context: string
  created_at: string
}

// 对话消息类型
export interface Message {
  id: string
  user_id: string
  task_id?: string
  role: 'user' | 'assistant'
  content: string
  emotion_score?: number
  created_at: string
}

// 任务类型
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  original_input: string
  difficulty_level: number
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  created_at: string
  updated_at: string
  subtasks?: SubTask[]
}

// 子任务类型
export interface SubTask {
  id: string
  task_id: string
  title: string
  description?: string
  order_index: number
  estimated_minutes: number
  actual_minutes?: number
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  emotion_score_when_created: number
  created_at: string
  completed_at?: string
}

// 番茄钟会话类型
export interface PomodoroSession {
  id: string
  user_id: string
  subtask_id?: string
  duration_minutes: number
  actual_duration_minutes?: number
  status: 'completed' | 'interrupted' | 'paused'
  started_at: string
  ended_at?: string
}

// 成长笔记类型
export interface GrowthNote {
  id: string
  user_id: string
  task_id?: string
  content: string
  note_type: 'reflection' | 'achievement' | 'insight'
  created_at: string
}

// API响应类型
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// 任务拆解策略类型
export interface DecompositionStrategy {
  type: 'atomic' | 'process-oriented' | 'goal-oriented'
  maxDuration: number
  complexity: 'minimal' | 'moderate' | 'flexible'
  guidance: 'step-by-step' | 'structured' | 'framework'
}

// Chat API 请求/响应类型
export interface ChatRequest {
  message: string
  taskId?: string
  emotionScore?: number
}

export interface ChatResponse {
  response: string
  emotionScore: number
  emotionTags: string[]
  needsEmotionInput?: boolean
  suggestedActions?: string[]
  task?: Task
}

// 任务拆解请求/响应类型
export interface TaskDecomposeRequest {
  taskDescription: string
  emotionScore: number
  userProfile?: Partial<UserProfile>
}

export interface TaskDecomposeResponse {
  task: Task
  subtasks: SubTask[]
  strategy: DecompositionStrategy
} 