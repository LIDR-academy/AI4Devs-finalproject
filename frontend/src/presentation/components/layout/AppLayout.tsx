import type { ReactNode } from 'react'

interface AppLayoutProps {
  header: ReactNode
  children: ReactNode
}

export default function AppLayout({ header, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {header}
        {children}
      </div>
    </div>
  )
}
