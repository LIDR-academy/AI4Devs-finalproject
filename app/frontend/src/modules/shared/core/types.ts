import type { ReactNode } from 'react'

export type Complexity = 'LOW' | 'MEDIUM' | 'HIGH'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type SectionView = 'dashboard' | 'projects' | 'usecases' | 'upcoming' | 'roles' | 'estimation' | 'report'

export type ProjectSummary = {
  id: string
  name: string
  description: string
  complexity: Complexity | null
  createdAt: string
  _count?: {
    useCases: number
  }
}

export type EstimationResult = {
  id: string
  totalHours: number
  totalCost: number
  assumptions: string
  risks: string
  phases: {
    id: string
    name: string
    description: string
    order: number
    roleEstimates: {
      id: string
      role: string
      hours: number
    }[]
  }[]
  tokens: {
    id: string
    model: string
    tokens: number
    cost: number
  }[]
}

export type ProjectReport = {
  id: string
  name: string
  description: string
  complexity: Complexity
  useCases: {
    id: string
    title: string
    description: string
    priority: Priority
  }[]
  estimation: EstimationResult | null
  summary: {
    useCaseCount: number
    phaseCount: number
    roleCount: number
    totalTokens: number
    tokenCost: number
    laborCost: number
    averageHoursPerUseCase: number
    hoursByRole: Record<string, number>
    generatedAt: string
  } | null
}

export type UseCaseTableRow = {
  id: string
  title: string
  description: string
  priority: Priority
  createdAt: string
  project: {
    id: string
    name: string
    complexity: Complexity
  }
}

export type AgentRole = {
  id: string
  key: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UpcomingFeature = {
  key: string
  title: string
  description: string
  priority: 'HIGH' | 'MEDIUM'
}

export type ProjectEstimationHistoryItem = {
  id: string
  version: number
  totalHours: number
  totalCost: number
  createdAt: string
  updatedAt: string
  tokens: {
    model: string
    tokens: number
    cost: number
  }[]
}

export type SidebarItem = {
  section: SectionView
  label: string
  icon: ReactNode
}
