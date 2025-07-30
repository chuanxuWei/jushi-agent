'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmotionScoreInputProps {
  onSubmit: (score: number) => void
  suggestedScore?: number
}

export function EmotionScoreInput({ onSubmit, suggestedScore }: EmotionScoreInputProps) {
  const [score, setScore] = useState(suggestedScore || 5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const emotionTags = {
    low: ['完全无法动手', '频繁自我否定', '回避任务'],
    medium: ['犹豫拖延', '担心做不好', '步骤混乱'],
    high: ['有行动力', '仅需轻微引导', '明确目标']
  }

  const getEmotionLevel = (score: number) => {
    if (score <= 3) return 'low'
    if (score <= 6) return 'medium'
    return 'high'
  }

  const getEmotionDescription = (score: number) => {
    if (score <= 3) return '重度焦虑'
    if (score <= 6) return '中度焦虑'
    return '状态良好'
  }

  const currentTags = emotionTags[getEmotionLevel(score)]

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    onSubmit(score)
  }

  return (
    <div className="emotion-score-input">
      <h3 className="mb-6 text-lg font-semibold text-center">
        请评估一下你现在的状态（1-10分）
      </h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">1分</span>
          <span className="text-sm text-muted-foreground">10分</span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' && score < 10) {
                setScore(prev => prev + 1)
              } else if (e.key === 'ArrowLeft' && score > 1) {
                setScore(prev => prev - 1)
              }
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            role="slider"
            aria-label="情绪评分"
          />
        </div>
        
        <div className="flex items-center justify-center mt-4">
          <span className="text-2xl font-bold text-primary">
            {score}分
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            ({getEmotionDescription(score)})
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium">
          选择符合你现在感受的标签：
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {currentTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1 text-sm rounded-full border transition-colors",
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground border-primary selected"
                  : "bg-background text-foreground border-border hover:bg-muted"
              )}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full"
        size="lg"
      >
        确定
      </Button>
    </div>
  )
} 