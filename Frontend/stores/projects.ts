import { defineStore } from 'pinia'

export interface Project {
  id: string
  name: string
  client: string
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold'
  progress: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  manager: string
  team: string[]
  description?: string
  kpis: KPI[]
  phases: ProjectPhase[]
}

export interface ProjectPhase {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'pending' | 'in-progress' | 'completed'
  progress: number
  activities: Activity[]
}

export interface Activity {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: 'pending' | 'in-progress' | 'completed'
  progress: number
  assignedTo: string[]
  dependencies: string[]
}

export interface KPI {
  id: string
  name: string
  current: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  category: string
}

export interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  filters: {
    status: string
    client: string
    manager: string
  }
}

export const useProjectStore = defineStore('projects', {
  state: (): ProjectState => ({
    projects: [],
    currentProject: null,
    loading: false,
    filters: {
      status: 'all',
      client: 'all',
      manager: 'all'
    }
  }),

  getters: {
    filteredProjects: (state) => {
      return state.projects.filter(project => {
        if (state.filters.status !== 'all' && project.status !== state.filters.status) return false
        if (state.filters.client !== 'all' && project.client !== state.filters.client) return false
        if (state.filters.manager !== 'all' && project.manager !== state.filters.manager) return false
        return true
      })
    },

    projectsByStatus: (state) => {
      const statusCounts = {
        planning: 0,
        'in-progress': 0,
        review: 0,
        completed: 0,
        'on-hold': 0
      }
      
      state.projects.forEach(project => {
        statusCounts[project.status]++
      })
      
      return statusCounts
    },

    totalBudget: (state) => {
      return state.projects.reduce((total, project) => total + project.budget, 0)
    },

    totalSpent: (state) => {
      return state.projects.reduce((total, project) => total + project.spent, 0)
    },

    averageProgress: (state) => {
      if (state.projects.length === 0) return 0
      const totalProgress = state.projects.reduce((total, project) => total + project.progress, 0)
      return Math.round(totalProgress / state.projects.length)
    }
  },

  actions: {
    async fetchProjects() {
      this.loading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data
        this.projects = [
          {
            id: '1',
            name: 'Optimización de Procesos Manufactureros',
            client: 'Industrias ABC',
            status: 'in-progress',
            progress: 65,
            startDate: '2024-01-15',
            endDate: '2024-06-15',
            budget: 500000,
            spent: 325000,
            manager: 'Miguel Rico',
            team: ['Ana García', 'Carlos López', 'María González'],
            description: 'Implementación de modelo de gestión para optimizar procesos manufactureros',
            kpis: [
              {
                id: '1',
                name: 'Eficiencia Operativa',
                current: 75,
                target: 90,
                unit: '%',
                trend: 'up',
                category: 'Operacional'
              },
              {
                id: '2',
                name: 'Reducción de Costos',
                current: 12,
                target: 20,
                unit: '%',
                trend: 'up',
                category: 'Financiero'
              }
            ],
            phases: [
              {
                id: '1',
                name: 'Análisis y Diagnóstico',
                startDate: '2024-01-15',
                endDate: '2024-02-15',
                status: 'completed',
                progress: 100,
                activities: []
              },
              {
                id: '2',
                name: 'Diseño de Soluciones',
                startDate: '2024-02-16',
                endDate: '2024-03-30',
                status: 'completed',
                progress: 100,
                activities: []
              },
              {
                id: '3',
                name: 'Implementación Hombro a Hombro',
                startDate: '2024-04-01',
                endDate: '2024-05-30',
                status: 'in-progress',
                progress: 60,
                activities: []
              }
            ]
          },
          {
            id: '2',
            name: 'Transformación Digital Corporativa',
            client: 'TechCorp Solutions',
            status: 'planning',
            progress: 15,
            startDate: '2024-03-01',
            endDate: '2024-08-30',
            budget: 750000,
            spent: 112500,
            manager: 'Laura Martínez',
            team: ['Pedro Sánchez', 'Elena Rodríguez'],
            description: 'Digitalización de procesos y capacitación del capital humano',
            kpis: [
              {
                id: '3',
                name: 'Adopción Digital',
                current: 30,
                target: 85,
                unit: '%',
                trend: 'up',
                category: 'Tecnológico'
              }
            ],
            phases: []
          },
          {
            id: '3',
            name: 'Mejora de Productividad Comercial',
            client: 'Comercial Norte',
            status: 'completed',
            progress: 100,
            startDate: '2023-09-01',
            endDate: '2024-02-28',
            budget: 300000,
            spent: 285000,
            manager: 'Roberto Silva',
            team: ['Diana Torres', 'Javier Mendoza'],
            description: 'Optimización de procesos comerciales y capacitación del equipo de ventas',
            kpis: [
              {
                id: '4',
                name: 'Incremento en Ventas',
                current: 25,
                target: 20,
                unit: '%',
                trend: 'up',
                category: 'Comercial'
              }
            ],
            phases: []
          }
        ]
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchProject(id: string) {
      const project = this.projects.find(p => p.id === id)
      if (project) {
        this.currentProject = project
      } else {
        // Fetch from API
        this.loading = true
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          // Mock fetch single project
          this.currentProject = this.projects[0] || null
        } finally {
          this.loading = false
        }
      }
    },

    updateProject(projectId: string, updates: Partial<Project>) {
      const index = this.projects.findIndex(p => p.id === projectId)
      if (index !== -1) {
        this.projects[index] = { ...this.projects[index], ...updates }
        if (this.currentProject?.id === projectId) {
          this.currentProject = this.projects[index]
        }
      }
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        status: 'all',
        client: 'all',
        manager: 'all'
      }
    }
  }
})
