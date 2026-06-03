import { useState } from 'react'
import { X } from 'lucide-react'

interface AddRewardModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (reward: { emoji: string; name: string; description: string; cost: number }) => void
}

const REWARD_EMOJIS = [
  '📺',
  '🍕',
  '🏖️',
  '🎁',
  '🎮',
  '🎵',
  '☕',
  '🍰',
  '🛍️',
  '📱',
  '🎯',
  '🌟',
  '🎨',
  '🎪',
]

export default function AddRewardModal({ isOpen, onClose, onAdd }: AddRewardModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(REWARD_EMOJIS[0])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState(50)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && description.trim()) {
      onAdd({
        emoji: selectedEmoji,
        name: name.trim(),
        description: description.trim(),
        cost,
      })
      setName('')
      setDescription('')
      setCost(50)
      setSelectedEmoji(REWARD_EMOJIS[0])
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Nueva recompensa</h2>
            <p className="text-sm text-gray-500 mt-1">
              Define una recompensa para canjearte con tus puntos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Icono</label>
            <div className="grid grid-cols-7 gap-2">
              {REWARD_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-yellow-100 ring-2 ring-yellow-400'
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
              placeholder="Ej: Película favorita"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Disfruta de una película sin culpa"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntos necesarios
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-medium transition-colors"
          >
            Añadir recompensa
          </button>
        </form>
      </div>
    </div>
  )
}
