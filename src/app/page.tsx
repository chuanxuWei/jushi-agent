import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            聚时
          </h1>
          <p className="text-lg text-gray-600">
            焦虑缓解与任务规划助手
          </p>
          <p className="text-sm text-gray-500">
            专为大学生设计的情绪-任务双驱动智能助手
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard" className="block">
            <Button className="w-full" size="lg">
              进入工作台
            </Button>
          </Link>
          
          <Link href="/chat" className="block">
            <Button variant="outline" className="w-full" size="lg">
              直接开始对话
            </Button>
          </Link>
          
          <div className="text-xs text-gray-400">
            MVP版本 - 无需注册即可体验
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-500">
          <p>✨ 智能情绪评估</p>
          <p>🎯 个性化任务拆解</p>
          <p>⏰ 番茄钟专注训练</p>
          <p>📊 成长数据分析</p>
        </div>
      </div>
    </div>
  )
} 