# 「聚时」焦虑缓解与任务规划 Agent - 开发需求文档

## 项目概述

「聚时」是一款专注于大学生群体的情绪-任务双驱动垂类 Agent，通过智能对话、情绪评估、任务拆解等功能，帮助用户缓解焦虑并完成任务规划与执行。

## 技术架构选择

### 推荐技术栈（适合初学者 + MVP 快速开发）

#### 前端技术栈
- **框架**: Next.js 14 (React 框架，内置路由和 API 功能)
- **UI 组件库**: Tailwind CSS + shadcn/ui (现代化组件库)
- **状态管理**: Zustand (轻量级状态管理)
- **数据获取**: SWR (数据同步和缓存)
- **图表库**: Recharts (情绪趋势图表)
- **日期处理**: date-fns
- **图标**: Lucide React

#### 后端技术栈
- **运行时**: Node.js
- **框架**: Next.js API Routes (全栈开发，简化部署)
- **数据库**: Supabase (PostgreSQL + 实时功能 + 认证)
- **ORM**: Prisma (类型安全的数据库访问)
- **AI 集成**: 硅基流动 API (推荐) / 火山引擎 豆包API
- **身份认证**: NextAuth.js + Supabase Auth

#### 部署和服务
- **部署平台**: Vercel (与 Next.js 完美集成)
- **数据库托管**: Supabase
- **文件存储**: Supabase Storage
- **域名和 CDN**: Vercel 自带

### 数据库设计

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户画像表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  high_efficiency_hours JSONB, -- ["20:00-22:00"]
  anxiety_triggers JSONB, -- ["deadline_pressure", "complex_tasks"]
  motivation_preference VARCHAR(50), -- "positive_encouragement" | "data_feedback"
  task_habits JSONB, -- {"pomodoro_duration": 25, "break_preference": 5}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 情绪记录表
CREATE TABLE emotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 1 AND score <= 10),
  emotion_tags JSONB, -- ["self_doubt", "goal_unclear"]
  context TEXT, -- 用户当时的情况描述
  created_at TIMESTAMP DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  original_input TEXT, -- 用户最初的任务描述
  difficulty_level INTEGER, -- 基于情绪评分确定的难度等级
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, paused
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 子任务表
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INTEGER,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  emotion_score_when_created INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 对话历史表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  emotion_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 番茄钟记录表
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES subtasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER DEFAULT 25,
  actual_duration_minutes INTEGER,
  status VARCHAR(20), -- completed, interrupted, paused
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- 成长笔记表
CREATE TABLE growth_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  note_type VARCHAR(50), -- reflection, achievement, insight
  created_at TIMESTAMP DEFAULT NOW()
);
```

## AI API 对比与推荐

### 硅基流动 API（强烈推荐）

**优势**：
- **免费额度**：新用户注册送2000万tokens，够开发和初期运营使用
- **价格低廉**：付费后约0.001元/1000tokens，比OpenAI便宜90%+
- **模型选择多**：支持deepseek-chat、Qwen2.5等多个开源模型
- **接口兼容**：完全兼容OpenAI API格式，迁移简单
- **响应速度快**：国内服务，延迟低

**注册地址**：https://siliconflow.cn
**文档地址**：https://docs.siliconflow.cn

### 火山引擎豆包 API（备选）

**优势**：
- **字节跳动出品**：技术实力强，模型质量高
- **中文优化**：对中文理解和生成能力强
- **企业级**：稳定性和安全性有保障

**劣势**：
- **收费较高**：比硅基流动贵3-5倍
- **免费额度少**：新用户免费额度较少
- **申请流程**：需要企业认证，个人开发者门槛高

### 成本对比（基于您的MVP需求）

假设MVP期间：
- 用户量：100人
- 每人每天对话：20轮
- 每轮平均tokens：500

**月度使用量**：100用户 × 20轮 × 500tokens × 30天 = 3000万tokens

**成本对比**：
- **硅基流动**：约30元/月（远低于免费额度）
- **火山引擎**：约150-200元/月
- **OpenAI GPT-4**：约600-800元/月

**建议**：强烈推荐使用硅基流动API，免费额度足够支撑整个MVP开发和初期运营。

### 1. 用户认证模块
```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    // 邮箱登录
    // 第三方登录（微信、QQ等）
  ],
}
```

### 2. AI 对话模块

#### 选择 1：硅基流动 API（推荐 - 性价比最高）
```typescript
// lib/ai/conversation.ts
export class ConversationAgent {
  private apiKey: string
  private baseURL: string = 'https://api.siliconflow.cn/v1'
  
  constructor() {
    this.apiKey = process.env.SILICONFLOW_API_KEY!
  }

  async generateResponse(
    userMessage: string,
    emotionScore: number,
    userProfile: UserProfile,
    conversationHistory: Message[]
  ) {
    const systemPrompt = this.buildSystemPrompt(emotionScore, userProfile)
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 或 'Qwen/Qwen2.5-7B-Instruct'
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    })

    const data = await response.json()
    return data.choices[0].message.content
  }

  private buildSystemPrompt(emotionScore: number, profile: UserProfile): string {
    // 根据情绪评分和用户画像构建系统提示
    let prompt = "你是聚时AI助手，专门帮助大学生缓解焦虑并完成任务规划..."
    
    if (emotionScore <= 3) {
      prompt += "用户现在处于重度焦虑状态，需要极度温和的语气和原子级任务拆解..."
    } else if (emotionScore <= 6) {
      prompt += "用户现在处于中度焦虑状态，需要流程化的任务拆解..."
    } else {
      prompt += "用户现在状态较好，可以进行目标导向的任务拆解..."
    }
    
    return prompt
  }
}
```

#### 选择 2：火山引擎 豆包API
```typescript
// lib/ai/conversation-doubao.ts
export class DoubaoConversationAgent {
  private apiKey: string
  private baseURL: string = 'https://ark.cn-beijing.volces.com/api/v3'
  
  constructor() {
    this.apiKey = process.env.DOUBAO_API_KEY!
  }

  async generateResponse(
    userMessage: string,
    emotionScore: number,
    userProfile: UserProfile,
    conversationHistory: Message[]
  ) {
    const systemPrompt = this.buildSystemPrompt(emotionScore, userProfile)
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'ep-20241230140932-z8wss', // 替换为您的端点ID
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const data = await response.json()
    return data.choices[0].message.content
  }
}
```

### 3. 情绪评估模块
```typescript
// lib/emotion/analyzer.ts
export class EmotionAnalyzer {
  private apiKey: string
  private useDoubao: boolean

  constructor(useDoubao = false) {
    this.useDoubao = useDoubao
    this.apiKey = useDoubao ? process.env.DOUBAO_API_KEY! : process.env.SILICONFLOW_API_KEY!
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    const endpoint = this.useDoubao 
      ? 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
      : 'https://api.siliconflow.cn/v1/chat/completions'
    
    const model = this.useDoubao 
      ? 'ep-20241230140932-z8wss' // 替换为您的豆包端点ID
      : 'deepseek-chat'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'system',
          content: `你是专业的情绪分析师。分析用户文本中的情绪状态，严格按照JSON格式返回：
          {
            "score": 1到10的整数,
            "tags": ["标签1", "标签2"],
            "reasoning": "分析原因"
          }
          
          评分标准：
          1-3分：重度焦虑（完全无法动手、频繁自我否定、回避任务）
          4-6分：中度焦虑（犹豫拖延、担心做不好、步骤混乱）
          7-10分：轻度焦虑/平静（有行动力、仅需轻微引导、明确目标）`
        }, {
          role: 'user',
          content: text
        }],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    const data = await response.json()
    
    // 尝试解析JSON，如果失败则使用正则提取
    try {
      return JSON.parse(data.choices[0].message.content)
    } catch (error) {
      // 备用解析方案
      const content = data.choices[0].message.content
      const scoreMatch = content.match(/"score":\s*(\d+)/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5
      
      return {
        score,
        tags: ["需要关注"],
        reasoning: "解析失败，使用默认评分"
      }
    }
  }

  async suggestEmotionScore(userInput: string): Promise<number> {
    // 基于用户输入建议情绪评分
    const analysis = await this.analyzeEmotion(userInput)
    return analysis.score
  }
}
```

### 4. 任务拆解模块
```typescript
// lib/task/decomposer.ts
export class TaskDecomposer {
  async decomposeTask(
    taskDescription: string,
    emotionScore: number,
    userProfile: UserProfile
  ): Promise<SubTask[]> {
    const prompt = this.buildDecompositionPrompt(emotionScore)
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: prompt
      }, {
        role: 'user',
        content: `任务：${taskDescription}\n情绪评分：${emotionScore}\n用户习惯：${JSON.stringify(userProfile.task_habits)}`
      }],
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content!)
    return result.subtasks
  }

  private buildDecompositionPrompt(emotionScore: number): string {
    if (emotionScore <= 3) {
      return `将任务拆解为原子级步骤，每个步骤必须：
      1. 无需思考即可执行
      2. 耗时不超过5分钟
      3. 有明确的完成标准
      返回JSON格式的子任务列表`
    } else if (emotionScore <= 6) {
      return `将任务拆解为流程化步骤，每个步骤包含：
      1. 明确的时间预估
      2. 具体的成果物
      3. 循序渐进的逻辑
      返回JSON格式的子任务列表`
    } else {
      return `进行目标导向的任务拆解，保留用户自主性：
      1. 以结果倒推步骤
      2. 提供框架指导
      3. 允许个性化调整
      返回JSON格式的子任务列表`
    }
  }
}
```

### 5. 番茄钟模块
```typescript
// components/PomodoroTimer.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTimer } from 'react-timer-hook'

export function PomodoroTimer({ 
  subtaskId, 
  initialMinutes = 25,
  onComplete 
}: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentSubtask, setCurrentSubtask] = useState<SubTask | null>(null)

  const expiryTimestamp = new Date()
  expiryTimestamp.setMinutes(expiryTimestamp.getMinutes() + initialMinutes)

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning: timerRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ 
    expiryTimestamp, 
    onExpire: handleTimerComplete 
  })

  async function handleTimerComplete() {
    // 记录番茄钟完成
    await savePomodoroSession({
      subtask_id: subtaskId,
      duration_minutes: initialMinutes,
      actual_duration_minutes: initialMinutes,
      status: 'completed'
    })

    // 显示鼓励语
    showEncouragement()
    
    onComplete?.(subtaskId)
  }

  return (
    <div className="pomodoro-timer">
      <div className="time-display">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      <div className="controls">
        <button onClick={start} disabled={timerRunning}>
          开始
        </button>
        <button onClick={pause} disabled={!timerRunning}>
          暂停
        </button>
        <button onClick={resume} disabled={timerRunning}>
          继续
        </button>
      </div>

      {currentSubtask && (
        <div className="current-task">
          正在进行：{currentSubtask.title}
        </div>
      )}
    </div>
  )
}
```

## API 接口设计

### RESTful API 端点

```typescript
// pages/api/conversations/index.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message, taskId } = req.body
    
    // 1. 分析情绪
    const emotionAnalysis = await emotionAnalyzer.analyzeEmotion(message)
    
    // 2. 获取用户画像
    const userProfile = await getUserProfile(userId)
    
    // 3. 生成AI回复
    const aiResponse = await conversationAgent.generateResponse(
      message,
      emotionAnalysis.score,
      userProfile,
      conversationHistory
    )
    
    // 4. 保存对话记录
    await saveConversation({
      user_id: userId,
      task_id: taskId,
      role: 'user',
      content: message,
      emotion_score: emotionAnalysis.score
    })
    
    await saveConversation({
      user_id: userId,
      task_id: taskId,
      role: 'assistant',
      content: aiResponse
    })
    
    res.json({
      response: aiResponse,
      emotionScore: emotionAnalysis.score,
      emotionTags: emotionAnalysis.tags
    })
  }
}

// pages/api/tasks/decompose.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { taskDescription, emotionScore } = req.body
    
    // 任务拆解
    const subtasks = await taskDecomposer.decomposeTask(
      taskDescription,
      emotionScore,
      userProfile
    )
    
    // 保存任务和子任务
    const task = await createTask({
      user_id: userId,
      title: taskDescription,
      difficulty_level: emotionScore <= 3 ? 1 : emotionScore <= 6 ? 2 : 3
    })
    
    const savedSubtasks = await Promise.all(
      subtasks.map(subtask => createSubtask({
        task_id: task.id,
        ...subtask,
        emotion_score_when_created: emotionScore
      }))
    )
    
    res.json({
      task,
      subtasks: savedSubtasks
    })
  }
}
```

## 前端页面结构

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── page.tsx                 # 主面板
│   │   ├── tasks/
│   │   │   ├── page.tsx             # 任务列表
│   │   │   └── [id]/page.tsx        # 任务详情
│   │   ├── chat/
│   │   │   └── page.tsx             # AI对话界面
│   │   ├── analytics/
│   │   │   └── page.tsx             # 数据分析
│   │   └── profile/
│   │       └── page.tsx             # 用户设置
│   └── layout.tsx
├── components/
│   ├── ui/                          # shadcn/ui 组件
│   ├── Chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── EmotionScoreInput.tsx
│   ├── Task/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── SubtaskItem.tsx
│   │   └── TaskDecomposer.tsx
│   ├── Timer/
│   │   ├── PomodoroTimer.tsx
│   │   └── TimerStats.tsx
│   └── Analytics/
│       ├── EmotionTrendChart.tsx
│       └── ProductivityChart.tsx
├── lib/
│   ├── ai/
│   ├── db/
│   ├── utils/
│   └── hooks/
└── types/
    └── index.ts
```

## 关键功能实现细节

### 1. 实时对话界面
```typescript
// components/Chat/ChatInterface.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'

export function ChatInterface() {
  const [emotionScore, setEmotionScore] = useState<number | null>(null)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      // 处理情绪评分建议
      if (response.headers.get('x-suggested-emotion-score')) {
        setEmotionScore(parseInt(response.headers.get('x-suggested-emotion-score')!))
      }
    }
  })

  const handleEmotionScoreSubmit = async (score: number) => {
    setEmotionScore(score)
    
    // 如果需要任务拆解
    if (currentTask && !currentTask.subtasks?.length) {
      await decomposeCurrentTask(score)
    }
  }

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map(message => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            onTaskCreate={setCurrentTask}
          />
        ))}
      </div>

      {emotionScore === null && (
        <EmotionScoreInput onSubmit={handleEmotionScoreSubmit} />
      )}

      <form onSubmit={handleSubmit} className="input-form">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="告诉我你现在的任务或感受..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          发送
        </button>
      </form>
    </div>
  )
}
```

### 2. 情绪评分组件
```typescript
// components/Chat/EmotionScoreInput.tsx
export function EmotionScoreInput({ onSubmit }: { onSubmit: (score: number) => void }) {
  const [score, setScore] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const emotionTags = {
    'low': ['完全无法动手', '频繁自我否定', '回避任务'],
    'medium': ['犹豫拖延', '担心做不好', '步骤混乱'],
    'high': ['有行动力', '仅需轻微引导', '明确目标']
  }

  return (
    <div className="emotion-score-input">
      <h3>请评估一下你现在的状态（1-10分）</h3>
      
      <div className="score-slider">
        <input
          type="range"
          min="1"
          max="10"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
        />
        <span className="score-display">{score}分</span>
      </div>

      <div className="emotion-tags">
        <h4>选择符合你现在感受的标签：</h4>
        {(score <= 3 ? emotionTags.low : 
          score <= 6 ? emotionTags.medium : 
          emotionTags.high).map(tag => (
          <button
            key={tag}
            onClick={() => {
              setSelectedTags(prev => 
                prev.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )
            }}
            className={selectedTags.includes(tag) ? 'selected' : ''}
          >
            {tag}
          </button>
        ))}
      </div>

      <button onClick={() => onSubmit(score)}>
        确定
      </button>
    </div>
  )
}
```

## 第三方集成

### 1. Todoist API 集成
```typescript
// lib/integrations/todoist.ts
export class TodoistIntegration {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createTask(subtask: SubTask): Promise<TodoistTask> {
    const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: subtask.title,
        description: subtask.description,
        due_string: subtask.dueDate ? format(subtask.dueDate, 'yyyy-MM-dd') : undefined
      })
    })

    return response.json()
  }
}
```

### 2. 日历集成
```typescript
// lib/integrations/calendar.ts
export class CalendarIntegration {
  async scheduleTask(subtask: SubTask, userPreferences: UserProfile) {
    // 根据用户高效时段安排任务
    const preferredHours = userPreferences.high_efficiency_hours
    const scheduledTime = findNextAvailableSlot(preferredHours, subtask.estimated_minutes)
    
    // 创建日历事件
    await createCalendarEvent({
      title: `聚时任务：${subtask.title}`,
      start: scheduledTime,
      duration: subtask.estimated_minutes,
      description: subtask.description
    })
  }
}
```

## 部署配置

### 1. 环境变量配置
```bash
# .env.local
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI API 配置（选择其中一个）
# 硅基流动（推荐）
SILICONFLOW_API_KEY=your-siliconflow-api-key

# 或者 火山引擎豆包
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_ENDPOINT_ID=ep-20241230140932-z8wss

# 第三方集成
TODOIST_CLIENT_ID=your-todoist-client-id
TODOIST_CLIENT_SECRET=your-todoist-client-secret
```

### 2. Vercel 部署配置
```json
// vercel.json
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXTAUTH_URL": "@nextauth-url",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

## 开发流程建议

### Phase 1: MVP 核心功能（2-3周）
1. **用户认证系统**
   - 邮箱注册登录
   - 基础用户信息管理

2. **基础对话功能**
   - AI 对话界面
   - 消息历史记录
   - 简单情绪识别

3. **任务拆解功能**
   - 基于情绪评分的任务拆解
   - 子任务列表展示
   - 简单的完成状态管理

### Phase 2: 增强功能（2-3周）
1. **番茄钟集成**
   - 计时器功能
   - 与子任务关联
   - 完成统计

2. **用户画像系统**
   - 高效时段设置
   - 习惯偏好记录
   - 个性化建议

3. **数据分析面板**
   - 情绪趋势图表
   - 任务完成统计
   - 成长记录

### Phase 3: 高级功能（3-4周）
1. **第三方集成**
   - Todoist 同步
   - 日历集成
   - 其他工具连接

2. **智能优化**
   - 学习用户行为模式
   - 动态调整拆解策略
   - 智能时间安排

3. **社交功能**
   - 成长笔记分享
   - 同伴激励系统

## 开发工具和资源

### 推荐开发工具
- **IDE**: Cursor (AI 辅助编程)
- **数据库管理**: Supabase Dashboard
- **API 测试**: Postman 或 Thunder Client
- **版本控制**: Git + GitHub
- **项目管理**: GitHub Projects 或 Notion

### 学习资源
- **Next.js 官方文档**: https://nextjs.org/docs
- **Supabase 文档**: https://supabase.com/docs
- **硅基流动 API 文档**: https://docs.siliconflow.cn
- **火山引擎豆包文档**: https://www.volcengine.com/docs/82379
- **Tailwind CSS**: https://tailwindcss.com/docs

### 开发辅助
- **shadcn/ui 组件**: https://ui.shadcn.com/
- **React Hook Form**: 表单处理
- **React Query/SWR**: 数据同步
- **Framer Motion**: 动画效果

这个技术栈选择考虑了您作为初学者的情况，同时确保能够快速开发出 MVP。建议先从 Phase 1 开始，逐步迭代添加功能。