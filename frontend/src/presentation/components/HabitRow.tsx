import { Check, X } from 'lucide-react'

interface HabitRowProps {
  id: string
  emoji: string
  name: string
  points: number
  streak?: number
  completionStatus: Array<'completed' | 'failed' | 'pending'>
  onToggleDay: (habitId: string, dayIndex: number) => void
  onDelete: (habitId: string) => void
}

export default function HabitRow({
  id,
  emoji,
  name,
  streak,
  completionStatus,
  onToggleDay,
  onDelete,
}: HabitRowProps) {
  return (
    <div className="grid grid-cols-[1fr_repeat(7,48px)_24px] gap-2 items-center py-3 border-b border-gray-100 last:border-0">
      {/* Habit info column */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate">{name}</div>
          {streak && streak > 0 && <div className="text-xs text-orange-500">🔥 {streak} días</div>}
        </div>
      </div>

      {/* Day completion buttons - 7 columns */}
      {completionStatus.map((status, index) => (
        <div key={index} className="flex justify-center">
          <button
            onClick={() => onToggleDay(id, index)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              status === 'completed'
                ? 'bg-green-500 text-white'
                : status === 'failed'
                  ? 'bg-red-400 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status === 'completed' && <Check className="w-4 h-4" />}
            {status === 'failed' && <X className="w-4 h-4" />}
          </button>
        </div>
      ))}

      {/* Delete button column */}
      <div className="flex justify-center">
        <button
          onClick={() => onDelete(id)}
          className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  )
}
