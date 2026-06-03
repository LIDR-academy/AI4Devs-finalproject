import { useState } from 'react'
import { X } from 'lucide-react'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (habit: { emoji: string; name: string; pointsPerDay: number; penalty: number }) => void
}

const HABIT_EMOJIS = [
  '🏋️',
  '🚴',
  '🏃',
  '🔥',
  '💧',
  '📚',
  '🚫',
  '🎨',
  '🎯',
  '🍎',
  '🎵',
  '✏️',
  '📱',
  '🧘',
  '🎮',
  '🌟',
]

export default function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(HABIT_EMOJIS[0])
  const [name, setName] = useState('')
  const [pointsPerDay, setPointsPerDay] = useState(5)
  const [penalty, setPenalty] = useState(3)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd({
        emoji: selectedEmoji,
        name: name.trim(),
        pointsPerDay,
        penalty,
      })
      setName('')
      setPointsPerDay(5)
      setPenalty(3)
      setSelectedEmoji(HABIT_EMOJIS[0])
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Añadir hábito</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Emoji</label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-green-100 ring-2 ring-green-400'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Caminar 30 min"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Puntos por día</label>
              <input
                type="number"
                value={pointsPerDay}
                onChange={(e) => setPointsPerDay(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penalización si fallas
              </label>
              <input
                type="number"
                value={penalty}
                onChange={(e) => setPenalty(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            Añadir hábito
          </button>
        </form>
      </div>
    </div>
  )
}
