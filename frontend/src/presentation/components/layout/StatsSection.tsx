import type { ReactNode } from 'react'

interface StatsSectionProps {
  children: ReactNode
}

export default function StatsSection({ children }: StatsSectionProps) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{children}</div>
}
