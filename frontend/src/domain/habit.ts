export type CompletionStatus = 'completed' | 'failed' | 'pending'

export interface Habit {
  id: string
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
  streak: number
  completionStatus: CompletionStatus[]
}

export function computeStreakFromStatus(status: CompletionStatus[]): number {
  let streak = 0
  for (let i = 0; i < status.length; i++) {
    if (status[i] === 'completed') {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function toggleHabitDayCompletion(habit: Habit, dayIndex: number): Habit {
  const newStatus = [...habit.completionStatus]
  const currentStatus = newStatus[dayIndex]

  if (currentStatus === 'pending') {
    newStatus[dayIndex] = 'completed'
  } else if (currentStatus === 'completed') {
    newStatus[dayIndex] = 'failed'
  } else {
    newStatus[dayIndex] = 'pending'
  }

  return {
    ...habit,
    completionStatus: newStatus,
    streak: computeStreakFromStatus(newStatus),
  }
}

export interface HabitStats {
  thisWeekPoints: number
  lastWeekPoints: number
  penalties: number
  maxStreak: number
}

/** `lastWeekPoints` se mantiene como valor fijo de demo (comportamiento previo en App). */
export function calculateHabitStats(habits: Habit[]): HabitStats {
  let thisWeekPoints = 0
  const lastWeekPoints = 72
  let penalties = 0
  let maxStreak = 0

  habits.forEach((habit) => {
    habit.completionStatus.forEach((status) => {
      if (status === 'completed') thisWeekPoints += habit.pointsPerDay
      if (status === 'failed') penalties += habit.penalty
    })
    if (habit.streak > maxStreak) maxStreak = habit.streak
  })

  return { thisWeekPoints, lastWeekPoints, penalties, maxStreak }
}

export function totalPointsFromStats(stats: HabitStats): number {
  return stats.thisWeekPoints + stats.lastWeekPoints - stats.penalties
}

export function calculateTodayProgressPercent(habits: Habit[], currentDayIndex: number): number {
  if (habits.length === 0 || currentDayIndex < 0) return 0
  const completedToday = habits.filter(
    (h) => h.completionStatus[currentDayIndex] === 'completed'
  ).length
  return Math.round((completedToday / habits.length) * 100)
}

export function createHabitFromFormInput(
  input: { emoji: string; name: string; pointsPerDay: number; penalty: number },
  id: string
): Habit {
  return {
    id,
    ...input,
    streak: 0,
    completionStatus: ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'],
  }
}
