import { Calendar } from 'lucide-react'
import type { ReactNode } from 'react'

interface CalendarSectionProps {
  action?: ReactNode
  children: ReactNode
}

export default function CalendarSection({ action, children }: CalendarSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Calendario semanal</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
