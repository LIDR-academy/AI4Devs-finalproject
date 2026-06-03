import { Gift } from 'lucide-react'
import type { ReactNode } from 'react'

interface RewardsSectionProps {
  action?: ReactNode
  children: ReactNode
}

export default function RewardsSection({ action, children }: RewardsSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-600" />
          <h2 className="text-xl font-semibold text-gray-800">Recompensas</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
