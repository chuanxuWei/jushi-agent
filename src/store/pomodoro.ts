import { create } from 'zustand'
import { POMODORO_CONFIG } from '@/lib/config'

export type PomodoroMode = 'work' | 'short_break' | 'long_break'

interface PomodoroState {
  mode: PomodoroMode
  isRunning: boolean
  remainingMs: number
  completedWorkSessions: number
  boundSubtaskId?: string

  start: (minutes?: number, subtaskId?: string) => void
  pause: () => void
  resume: () => void
  reset: () => void
  switchMode: (mode: PomodoroMode, minutes?: number) => void
}

let intervalId: ReturnType<typeof setInterval> | null = null
let lastTickAt = 0

function clearTimer() {
  if (intervalId) {
    clearInterval(intervalId as unknown as number)
    intervalId = null
  }
}

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  function startInterval() {
    if (intervalId) return
    lastTickAt = Date.now()
    intervalId = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickAt
      lastTickAt = now

      const state = get()
      if (!state.isRunning) return

      const nextRemaining = state.remainingMs - elapsed
      if (nextRemaining <= 0) {
        const wasWork = state.mode === 'work'
        const updatedCompleted = wasWork
          ? state.completedWorkSessions + 1
          : state.completedWorkSessions

        const nextMode: PomodoroMode = wasWork
          ? (updatedCompleted % POMODORO_CONFIG.longBreakAfter === 0
              ? 'long_break'
              : 'short_break')
          : 'work'

        const nextMinutes =
          nextMode === 'work'
            ? POMODORO_CONFIG.workMinutes
            : nextMode === 'short_break'
              ? POMODORO_CONFIG.shortBreakMinutes
              : POMODORO_CONFIG.longBreakMinutes

        set({
          completedWorkSessions: updatedCompleted,
          mode: nextMode,
          remainingMs: nextMinutes * 60 * 1000,
          isRunning: POMODORO_CONFIG.autoStartNext,
        })
      } else {
        set({ remainingMs: nextRemaining })
      }
    }, POMODORO_CONFIG.tickIntervalMs)
  }

  return {
    mode: 'work',
    isRunning: false,
    remainingMs: POMODORO_CONFIG.workMinutes * 60 * 1000,
    completedWorkSessions: 0,
    boundSubtaskId: undefined,

    start: (minutes, subtaskId) => {
      clearTimer()
      const durationMs = (minutes ?? POMODORO_CONFIG.workMinutes) * 60 * 1000
      set({
        mode: 'work',
        isRunning: true,
        remainingMs: durationMs,
        boundSubtaskId: subtaskId,
      })
      startInterval()
    },

    pause: () => {
      set({ isRunning: false })
    },

    resume: () => {
      if (get().isRunning) return
      set({ isRunning: true })
      lastTickAt = Date.now()
      startInterval()
    },

    reset: () => {
      clearTimer()
      set({
        mode: 'work',
        isRunning: false,
        remainingMs: POMODORO_CONFIG.workMinutes * 60 * 1000,
        boundSubtaskId: undefined,
        completedWorkSessions: 0,
      })
    },

    switchMode: (mode, minutes) => {
      const durationMinutes = minutes ?? (
        mode === 'work'
          ? POMODORO_CONFIG.workMinutes
          : mode === 'short_break'
            ? POMODORO_CONFIG.shortBreakMinutes
            : POMODORO_CONFIG.longBreakMinutes
      )
      set({
        mode,
        remainingMs: durationMinutes * 60 * 1000,
        isRunning: false,
      })
    },
  }
})


