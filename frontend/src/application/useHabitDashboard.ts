import { useMemo, useState } from 'react'
import type { Habit } from '../domain/habit'
import type { Reward } from '../domain/reward'
import { INITIAL_HABITS, INITIAL_REWARDS } from '../domain/fixtures'
import {
  calculateHabitStats,
  calculateTodayProgressPercent,
  createHabitFromFormInput,
  toggleHabitDayCompletion,
  totalPointsFromStats,
} from '../domain/habit'
import { createRewardFromFormInput } from '../domain/reward'
import { buildWeekData, getCurrentDayIndexForWeek } from '../domain/week'

export function useHabitDashboard() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS)
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS)
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const stats = useMemo(() => calculateHabitStats(habits), [habits])
  const totalPoints = totalPointsFromStats(stats)

  const currentDayIndex = useMemo(() => getCurrentDayIndexForWeek(weekOffset), [weekOffset])

  const todayProgress = useMemo(
    () => calculateTodayProgressPercent(habits, currentDayIndex),
    [habits, currentDayIndex]
  )

  const weekData = useMemo(() => buildWeekData(weekOffset), [weekOffset])

  const handleToggleDay = (habitId: string, dayIndex: number) => {
    setHabits(
      habits.map((habit) =>
        habit.id === habitId ? toggleHabitDayCompletion(habit, dayIndex) : habit
      )
    )
  }

  const handleAddHabit = (newHabit: {
    emoji: string
    name: string
    pointsPerDay: number
    penalty: number
  }) => {
    const habit = createHabitFromFormInput(newHabit, Date.now().toString())
    setHabits([...habits, habit])
  }

  const handleDeleteHabit = (habitId: string) => {
    setHabits(habits.filter((h) => h.id !== habitId))
  }

  const handleAddReward = (newReward: {
    emoji: string
    name: string
    description: string
    cost: number
  }) => {
    const reward = createRewardFromFormInput(newReward, Date.now().toString())
    setRewards([...rewards, reward])
  }

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId)
    if (reward && totalPoints >= reward.cost) {
      alert(`¡Has canjeado: ${reward.name}! 🎉`)
    }
  }

  const handleDeleteReward = (rewardId: string) => {
    setRewards(rewards.filter((r) => r.id !== rewardId))
  }

  return {
    habits,
    rewards,
    isHabitModalOpen,
    setIsHabitModalOpen,
    isRewardModalOpen,
    setIsRewardModalOpen,
    weekOffset,
    setWeekOffset,
    stats,
    totalPoints,
    currentDayIndex,
    todayProgress,
    weekData,
    handleToggleDay,
    handleAddHabit,
    handleDeleteHabit,
    handleAddReward,
    handleRedeemReward,
    handleDeleteReward,
  }
}
