import { useHabitDashboard } from '../application/useHabitDashboard'
import Header from './components/Header'
import ProgressBar from './components/ProgressBar'
import StatCard from './components/StatCard'
import WeeklyCalendar from './components/WeeklyCalendar'
import HabitRow from './components/HabitRow'
import RewardCard from './components/RewardCard'
import AddHabitModal from './components/AddHabitModal'
import AddRewardModal from './components/AddRewardModal'
import UserProfileCard from './components/UserProfileCard'
import { Toaster } from './components/ui/sonner'
import AppLayout from './components/layout/AppLayout'
import StatsSection from './components/layout/StatsSection'
import CalendarSection from './components/layout/CalendarSection'
import RewardsSection from './components/layout/RewardsSection'

export default function App() {
  const {
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
  } = useHabitDashboard()

  const header = (
    <>
      <div className="relative mb-8">
        <div className="absolute top-0 right-0 z-10 hidden sm:block">
          <UserProfileCard />
        </div>
        <Header />
      </div>
      <ProgressBar progress={todayProgress} />
    </>
  )

  return (
    <>
      <AppLayout header={header}>
        <StatsSection>
          <StatCard
            icon="📊"
            value={stats.lastWeekPoints}
            label="Semana anterior"
            bgColor="#E8F5E9"
          />
          <StatCard icon="🏆" value={stats.thisWeekPoints} label="Esta semana" bgColor="#C8E6C9" />
          <StatCard icon="⚠️" value={-stats.penalties} label="Penalizaciones" bgColor="#FFCDD2" />
          <StatCard icon="🔥" value={stats.maxStreak} label="Mejor racha" bgColor="#FFE0B2" />
        </StatsSection>

        <CalendarSection
          action={
            <button
              onClick={() => setIsHabitModalOpen(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              + Nuevo hábito
            </button>
          }
        >
          <WeeklyCalendar
            weekDates={weekData.dates}
            weekRange={weekData.range}
            onPrevWeek={() => setWeekOffset(weekOffset - 1)}
            onNextWeek={() => setWeekOffset(weekOffset + 1)}
            currentDayIndex={currentDayIndex}
          />

          <div className="mt-6 space-y-1">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                id={habit.id}
                emoji={habit.emoji}
                name={habit.name}
                points={habit.pointsPerDay}
                streak={habit.streak}
                completionStatus={habit.completionStatus}
                onToggleDay={handleToggleDay}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        </CalendarSection>

        <RewardsSection
          action={
            <button
              onClick={() => setIsRewardModalOpen(true)}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              + Nueva recompensa
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                emoji={reward.emoji}
                name={reward.name}
                description={reward.description}
                cost={reward.cost}
                currentPoints={totalPoints}
                onRedeem={() => handleRedeemReward(reward.id)}
                onDelete={() => handleDeleteReward(reward.id)}
              />
            ))}
          </div>
        </RewardsSection>
      </AppLayout>

      <AddHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onAdd={handleAddHabit}
      />

      <AddRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        onAdd={handleAddReward}
      />

      <Toaster />
    </>
  )
}
