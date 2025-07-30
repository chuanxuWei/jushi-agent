import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            聚时工作台
          </h1>
          <p className="text-gray-600">
            欢迎使用聚时，您的智能学习助手
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI对话卡片 */}
          <div className="task-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                💬
              </div>
              <h2 className="text-lg font-semibold">AI助手对话</h2>
            </div>
            <p className="text-gray-600 mb-4">
              与聚时AI助手聊天，获得情绪支持和任务指导
            </p>
            <Link href="/chat">
              <Button className="w-full">开始对话</Button>
            </Link>
          </div>

          {/* 任务管理卡片 */}
          <div className="task-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                ✅
              </div>
              <h2 className="text-lg font-semibold">任务管理</h2>
            </div>
            <p className="text-gray-600 mb-4">
              管理您的任务和子任务，跟踪完成进度
            </p>
            <Button variant="outline" className="w-full" disabled>
              即将推出
            </Button>
          </div>

          {/* 情绪追踪卡片 */}
          <div className="task-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                📊
              </div>
              <h2 className="text-lg font-semibold">情绪分析</h2>
            </div>
            <p className="text-gray-600 mb-4">
              查看您的情绪趋势和成长数据
            </p>
            <Button variant="outline" className="w-full" disabled>
              即将推出
            </Button>
          </div>

          {/* 番茄钟卡片 */}
          <div className="task-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                ⏰
              </div>
              <h2 className="text-lg font-semibold">专注计时</h2>
            </div>
            <p className="text-gray-600 mb-4">
              使用番茄钟技术提升专注力
            </p>
            <Button variant="outline" className="w-full" disabled>
              即将推出
            </Button>
          </div>

          {/* 成长笔记卡片 */}
          <div className="task-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                📝
              </div>
              <h2 className="text-lg font-semibold">成长笔记</h2>
            </div>
            <p className="text-gray-600 mb-4">
              记录学习心得和成长感悟
            </p>
            <Button variant="outline" className="w-full" disabled>
              即将推出
            </Button>
          </div>

          {/* 设置卡片 */}
          <div className="task-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                ⚙️
              </div>
              <h2 className="text-lg font-semibold">个人设置</h2>
            </div>
            <p className="text-gray-600 mb-4">
              配置您的偏好和高效时段
            </p>
            <Button variant="outline" className="w-full" disabled>
              即将推出
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🚀 这是聚时MVP版本，更多功能正在开发中...
          </p>
        </div>
      </div>
    </div>
  )
} 