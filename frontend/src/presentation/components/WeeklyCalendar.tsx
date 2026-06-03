interface WeeklyCalendarProps {
  weekDates: Array<{ day: string; date: number; month?: string }>
  weekRange: string
  onPrevWeek: () => void
  onNextWeek: () => void
  currentDayIndex: number
}

export default function WeeklyCalendar({
  weekDates,
  weekRange,
  onPrevWeek,
  onNextWeek,
  currentDayIndex,
}: WeeklyCalendarProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevWeek}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <span className="text-gray-600">‹</span>
        </button>

        <span className="text-sm text-gray-600">{weekRange}</span>

        <button
          onClick={onNextWeek}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <span className="text-gray-600">›</span>
        </button>
      </div>

      {/* Calendar header - aligned with habit rows */}
      <div className="grid grid-cols-[1fr_repeat(7,48px)_24px] gap-2 mb-2">
        {/* Empty cell for habit name column */}
        <div></div>

        {/* Week day headers */}
        {weekDates.map((date, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-500 mb-0.5">{date.day}</div>
            <div
              className={`text-sm font-semibold ${
                index === currentDayIndex ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              {date.date}
            </div>
          </div>
        ))}

        {/* Empty cell for delete button column */}
        <div></div>
      </div>
    </div>
  )
}
