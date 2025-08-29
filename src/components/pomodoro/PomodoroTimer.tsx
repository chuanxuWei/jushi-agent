'use client'

import React, { useEffect, useMemo } from 'react'
import { usePomodoroStore } from '@/store/pomodoro'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Coffee, Timer } from 'lucide-react'

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${mm}:${ss}`
}

export interface PomodoroTimerProps {
  compact?: boolean
}

export default function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const { mode, isRunning, remainingMs, start, pause, resume, reset, switchMode } = usePomodoroStore()

  useEffect(() => {
    // 恢复时无需操作，store 自行管理 interval 生命周期
    return () => {
      // 卸载无需显式清理，store 内部管理
    }
  }, [])

  const title = useMemo(() => {
    if (mode === 'work') return '专注'
    if (mode === 'short_break') return '短休'
    return '长休'
  }, [mode])

  return (
    <div className={`rounded-xl border p-3 ${compact ? 'w-full' : 'w-full'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4" />
          <span className="text-sm text-gray-600 dark:text-gray-300">番茄钟 · {title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Button variant="ghost" size="sm" onClick={() => switchMode('work')}>专注</Button>
          <Button variant="ghost" size="sm" onClick={() => switchMode('short_break')}>短休</Button>
          <Button variant="ghost" size="sm" onClick={() => switchMode('long_break')}>长休</Button>
        </div>
      </div>

      <div className="flex items-end justify-center my-3">
        <div className="text-4xl font-mono tabular-nums select-none">
          {formatMs(remainingMs)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {isRunning ? (
          <Button size="sm" variant="secondary" onClick={pause}>
            <Pause className="w-4 h-4 mr-1" /> 暂停
          </Button>
        ) : (
          <Button size="sm" onClick={() => (mode === 'work' ? start() : resume())}>
            <Play className="w-4 h-4 mr-1" /> {mode === 'work' ? '开始' : '继续'}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-1" /> 重置
        </Button>
        {mode !== 'work' && (
          <Button size="sm" variant="ghost" onClick={() => switchMode('work')}>
            <Coffee className="w-4 h-4 mr-1" /> 回到专注
          </Button>
        )}
      </div>
    </div>
  )
}


