# 「聚时」焦虑缓解与任务规划 Agent - 开发规格文档 (Specification)

## 1. 项目核心概述

### 1.1 产品定位
- **产品名称**: 「聚时」(JuShi)
- **目标用户**: 大学生群体
- **核心价值**: 情绪-任务双驱动的智能规划助手
- **解决痛点**: 学业焦虑、任务拖延、效率低下

### 1.2 核心机制
```
用户输入 → 情绪评估 → 动态AI策略调整 → 智能任务拆解 → 执行指导 → 反馈优化
```

**情绪评分驱动策略**:
- **1-3分 (重度焦虑)**: 原子级任务拆解，极简操作指导
- **4-6分 (中度焦虑)**: 流程化拆解，循序渐进引导  
- **7-10分 (状态良好)**: 目标导向拆解，框架性指导

### 1.3 成功指标
- 用户焦虑评分持续改善
- 任务完成率提升 > 30%
- 用户日活跃度 > 70%
- 平均对话轮次 > 15轮/天

## 2. 技术架构

### 2.1 技术栈选型

| 技术层 | 选择 | 理由 |
|--------|------|------|
| 前端框架 | Next.js 14 | 全栈开发，内置API路由，部署简单 |
| 数据库 | Supabase (PostgreSQL) | 实时功能，内置认证，开发友好 |
| AI模型 | 硅基流动 API | 免费额度大，成本低，兼容OpenAI格式 |
| UI组件 | Tailwind CSS + shadcn/ui | 现代化设计，组件丰富 |
| 状态管理 | Zustand | 轻量级，学习成本低 |
| 部署平台 | Vercel | 与Next.js完美集成 |

### 2.2 系统架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面      │    │   API路由       │    │   外部服务      │
│                 │    │                 │    │                 │
│ • 对话界面      │◄──►│ • 情绪分析API   │◄──►│ • 硅基流动API   │
│ • 任务管理      │    │ • 任务拆解API   │    │ • Supabase DB   │
│ • 数据看板      │    │ • 用户认证API   │    │ • 第三方集成    │
│ • 个人设置      │    │ • 番茄钟API     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 3. 数据库设计

### 3.1 核心数据表

参考现有设计文档中的数据库结构，重点关注以下核心表：

- `users`: 用户基础信息
- `user_profiles`: 用户画像和偏好设置
- `emotion_records`: 情绪评分历史
- `conversations`: 对话记录
- `tasks`: 主任务
- `subtasks`: 子任务拆解
- `pomodoro_sessions`: 番茄钟记录
- `growth_notes`: 成长笔记

### 3.2 关键索引策略
```sql
-- 提升查询性能的关键索引
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX idx_emotion_records_user_score ON emotion_records(user_id, score, created_at DESC);
CREATE INDEX idx_subtasks_task_order ON subtasks(task_id, order_index);
CREATE INDEX idx_pomodoro_user_date ON pomodoro_sessions(user_id, started_at::date);
```

## 4. 详细开发规划

## 第一阶段：MVP核心功能 (2-3周)

### 4.1 任务1：用户认证系统

**目标**: 建立安全可靠的用户认证基础

**技术实现**:
- NextAuth.js + Supabase Adapter
- 邮箱注册/登录
- 会话管理和权限控制

**验收标准**:
- [ ] 用户可以通过邮箱注册账号
- [ ] 用户可以登录并保持会话状态
- [ ] 受保护的页面需要认证才能访问
- [ ] 登出功能正常工作

**关键文件**:
```
lib/auth/config.ts          # NextAuth配置
pages/api/auth/[...nextauth].ts  # 认证API
components/auth/LoginForm.tsx     # 登录组件
components/auth/RegisterForm.tsx  # 注册组件
```

### 4.2 任务2：基础对话与情绪分析

**目标**: 实现AI对话和实时情绪评估

**核心组件**:

1. **EmotionAnalyzer 模块**
```typescript
interface EmotionAnalysis {
  score: number;        // 1-10情绪评分
  tags: string[];       // 情绪标签
  reasoning: string;    // 分析理由
}
```

2. **EmotionScoreInput 组件**
- 滑动条选择评分
- 情绪标签多选
- 实时预览和确认

**验收标准**:
- [ ] 用户可以与AI进行流畅对话
- [ ] AI能准确识别用户文本中的情绪倾向
- [ ] 用户可以手动调整情绪评分
- [ ] 所有对话和情绪数据正确存储

**API设计**:
```typescript
POST /api/chat
Body: { message: string, taskId?: string }
Response: { 
  response: string, 
  emotionScore: number, 
  emotionTags: string[] 
}
```

### 4.3 任务3：情绪驱动的任务拆解

**目标**: 基于情绪评分动态调整任务拆解策略

**核心逻辑**:
```typescript
function getDecompositionStrategy(emotionScore: number) {
  if (emotionScore <= 3) {
    return {
      type: 'atomic',
      maxDuration: 5,     // 最多5分钟
      complexity: 'minimal', // 最小复杂度
      guidance: 'step-by-step' // 逐步指导
    }
  } else if (emotionScore <= 6) {
    return {
      type: 'process-oriented',
      maxDuration: 25,    // 番茄钟时长
      complexity: 'moderate',
      guidance: 'structured' // 结构化指导
    }
  } else {
    return {
      type: 'goal-oriented',
      maxDuration: 60,    // 最多1小时
      complexity: 'flexible',
      guidance: 'framework' // 框架性指导
    }
  }
}
```

**验收标准**:
- [ ] 不同情绪评分产生不同粒度的任务拆解
- [ ] 任务拆解结果符合对应策略的要求
- [ ] 子任务有明确的时间预估和完成标准
- [ ] 任务数据正确存储到数据库

### 4.4 任务4：任务展示与管理

**目标**: 清晰展示任务层级和状态管理

**关键组件**:
- `TaskList.tsx`: 任务列表展示
- `TaskCard.tsx`: 单个任务卡片
- `SubtaskItem.tsx`: 子任务项目
- `TaskProgress.tsx`: 进度指示器

**验收标准**:
- [ ] 主任务和子任务层级关系清晰
- [ ] 可以勾选完成子任务
- [ ] 任务状态实时更新
- [ ] 进度百分比正确计算

## 第二阶段：功能增强与体验优化 (2-3周)

### 4.5 任务1：番茄钟集成

**目标**: 将番茄钟与任务执行深度结合

**功能特性**:
- 子任务关联的番茄钟
- 可自定义时长（25/45/90分钟）
- 完成/中断状态记录
- 激励性反馈

**验收标准**:
- [ ] 可以为任意子任务启动番茄钟
- [ ] 计时器状态（开始/暂停/结束）正确管理
- [ ] 番茄钟数据正确记录到数据库
- [ ] 完成时显示鼓励信息

### 4.6 任务2：用户画像系统

**目标**: 收集用户偏好，实现个性化体验

**数据收集**:
```typescript
interface UserProfile {
  high_efficiency_hours: string[];  // ["09:00-11:00", "20:00-22:00"]
  anxiety_triggers: string[];       // ["deadline_pressure", "complex_tasks"]
  motivation_preference: string;    // "positive_encouragement" | "data_feedback"
  task_habits: {
    pomodoro_duration: number;      // 默认番茄钟时长
    break_preference: number;       // 休息偏好
    max_daily_tasks: number;        // 每日最大任务数
  }
}
```

**验收标准**:
- [ ] 用户可以设置个人偏好
- [ ] AI回复融入用户画像信息
- [ ] 任务拆解考虑用户习惯
- [ ] 高效时段影响任务安排建议

### 4.7 任务3：数据分析与可视化

**目标**: 提供数据驱动的成长反馈

**图表类型**:
- 情绪趋势折线图（7天/30天）
- 任务完成率环形图
- 番茄钟使用热力图
- 效率时段分析图

**验收标准**:
- [ ] 图表数据准确反映用户行为
- [ ] 支持不同时间维度查看
- [ ] 图表响应式适配
- [ ] 提供数据洞察建议

### 4.8 任务4：成长笔记

**目标**: 记录用户反思和成长历程

**功能设计**:
- 任务完成后引导写笔记
- 支持多种笔记类型（反思/成就/洞察）
- 关键词标签系统
- 历史笔记检索

**验收标准**:
- [ ] 完成重要任务后自动提示写笔记
- [ ] 笔记编辑体验流畅
- [ ] 支持搜索和标签筛选
- [ ] 可以关联到具体任务

## 第三阶段：高级功能与生态打通 (3-4周)

### 4.9 任务1：第三方API集成

**Todoist集成**:
```typescript
interface TodoistIntegration {
  syncSubtask(subtask: SubTask): Promise<TodoistTask>;
  updateTaskStatus(taskId: string, status: string): Promise<void>;
  importExistingTasks(): Promise<Task[]>;
}
```

**日历集成**:
```typescript
interface CalendarIntegration {
  scheduleTask(subtask: SubTask, timeSlot: TimeSlot): Promise<CalendarEvent>;
  findOptimalTimeSlots(duration: number, preferences: UserProfile): Promise<TimeSlot[]>;
}
```

**验收标准**:
- [ ] 一键同步子任务到Todoist
- [ ] 智能安排任务到日历
- [ ] 状态双向同步
- [ ] 冲突检测和处理

### 4.10 任务2：智能化与自适应优化

**目标**: 让AI学习用户行为模式，持续优化建议

**学习维度**:
- 任务预估时间 vs 实际完成时间
- 不同情绪状态下的执行效果
- 最佳拆解粒度识别
- 个性化激励方式

**验收标准**:
- [ ] 时间预估准确度持续提升
- [ ] 拆解策略基于历史数据优化
- [ ] 个性化建议越来越准确
- [ ] A/B测试验证优化效果

### 4.11 任务3：社区与激励功能

**目标**: 增加用户粘性和同伴激励

**功能模块**:
- 匿名成长笔记分享
- 同期用户对比（保护隐私）
- 成就徽章系统
- 每周挑战活动

**验收标准**:
- [ ] 用户可以选择分享成长笔记
- [ ] 隐私保护机制完善
- [ ] 激励系统促进用户活跃
- [ ] 社区氛围积极正向

## 5. API设计规范

### 5.1 通用响应格式
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### 5.2 核心API端点

| 端点 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/chat` | POST | AI对话和情绪分析 | ✓ |
| `/api/tasks` | GET/POST | 任务管理 | ✓ |
| `/api/tasks/decompose` | POST | 任务拆解 | ✓ |
| `/api/emotions` | GET/POST | 情绪记录 | ✓ |
| `/api/pomodoro` | POST/PUT | 番茄钟管理 | ✓ |
| `/api/analytics` | GET | 数据分析 | ✓ |
| `/api/profile` | GET/PUT | 用户画像 | ✓ |

## 6. 前端组件架构

### 6.1 组件层级结构
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── dashboard/         # 主应用页面
│   └── layout.tsx         # 根布局
├── components/
│   ├── ui/                # shadcn/ui基础组件
│   ├── common/            # 通用组件
│   ├── chat/              # 对话相关组件
│   ├── task/              # 任务管理组件
│   ├── timer/             # 番茄钟组件
│   └── analytics/         # 数据分析组件
├── lib/
│   ├── ai/                # AI相关功能
│   ├── db/                # 数据库操作
│   ├── hooks/             # 自定义Hook
│   └── utils/             # 工具函数
└── types/                 # TypeScript类型定义
```

### 6.2 关键组件设计

**ChatInterface 组件**:
```typescript
interface ChatInterfaceProps {
  initialMessages?: Message[];
  onTaskCreate?: (task: Task) => void;
  onEmotionUpdate?: (score: number) => void;
}
```

**TaskManager 组件**:
```typescript
interface TaskManagerProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onSubtaskComplete: (subtaskId: string) => void;
  emotionScore: number;
}
```

## 7. 性能和质量要求

### 7.1 性能指标
- 页面首次加载时间 < 2秒
- AI响应时间 < 3秒
- 数据库查询响应 < 500ms
- 前端交互响应 < 100ms

### 7.2 代码质量标准
- TypeScript覆盖率 > 95%
- 组件测试覆盖率 > 80%
- ESLint/Prettier代码规范
- 组件文档完整性

### 7.3 用户体验要求
- 移动端响应式适配
- 黑暗模式支持
- 离线状态处理
- 加载状态友好提示

## 8. 安全与隐私

### 8.1 数据安全
- 所有API请求需要认证
- 敏感数据加密存储
- SQL注入防护
- XSS攻击防护

### 8.2 隐私保护
- 情绪数据脱敏处理
- 对话记录加密存储
- 用户可删除所有个人数据
- 隐私设置透明化

## 9. 部署和运维

### 9.1 环境配置
```bash
# 生产环境变量
NEXTAUTH_URL=https://jushi.app
SUPABASE_URL=your-supabase-url
SILICONFLOW_API_KEY=your-api-key
```

### 9.2 监控指标
- 用户活跃度监控
- API响应时间监控
- 错误率告警
- 资源使用情况

### 9.3 备份策略
- 数据库每日自动备份
- 用户上传文件云存储
- 关键配置版本控制

## 10. 风险评估与应对

### 10.1 技术风险
| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| AI API限流 | 中 | 高 | 实现请求队列和重试机制 |
| 数据库性能瓶颈 | 低 | 中 | 查询优化和索引策略 |
| 第三方服务不稳定 | 中 | 中 | 降级方案和备用服务 |

### 10.2 业务风险
| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| 用户留存率低 | 中 | 高 | 加强用户反馈和产品迭代 |
| 情绪分析准确性不足 | 中 | 高 | 持续模型调优和用户校正 |
| 竞品功能模仿 | 高 | 中 | 专注差异化和用户体验 |

## 11. 成功标准与验收

### 11.1 MVP阶段验收标准
- [ ] 基础功能完整可用
- [ ] 核心业务闭环验证
- [ ] 技术架构稳定
- [ ] 用户体验基本满意

### 11.2 产品成熟度指标
- 用户日活跃度 > 70%
- 任务完成率提升 > 30%
- 用户满意度评分 > 4.5/5
- 系统可用性 > 99.5%

### 11.3 长期发展目标
- 月活用户突破10万
- 建立用户社区生态
- 拓展企业版本
- 多平台应用覆盖

---

本规格文档将作为「聚时」Agent开发的核心指导文档，所有功能开发和技术决策都应基于此文档进行。文档将随着项目进展持续更新和优化。 