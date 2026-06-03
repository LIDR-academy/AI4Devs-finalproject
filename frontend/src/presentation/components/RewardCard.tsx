import { Lock } from 'lucide-react'

interface RewardCardProps {
  emoji: string
  name: string
  description: string
  cost: number
  currentPoints: number
  onRedeem: () => void
  onDelete: () => void
}

export default function RewardCard({
  emoji,
  name,
  description,
  cost,
  currentPoints,
  onRedeem,
  onDelete,
}: RewardCardProps) {
  const canAfford = currentPoints >= cost
  const progressPercentage = Math.min((currentPoints / cost) * 100, 100)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm relative group">
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 w-6 h-6 text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        ×
      </button>

      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 mb-1">{name}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {!canAfford && <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </div>

      <div className="mb-3">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-yellow-600 font-medium">
          {cost} pts {!canAfford && `restantes`}
        </span>

        {canAfford && (
          <button
            onClick={onRedeem}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg text-sm font-medium transition-colors"
          >
            Canjear
          </button>
        )}
      </div>
    </div>
  )
}
