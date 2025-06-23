import { defineStore } from 'pinia'

export interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  assignedTo: string[]
  status: 'pending' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  createdAt: string
  updatedAt: string
  tags: string[]
  attachments: TaskAttachment[]
  comments: TaskComment[]
  checklist: ChecklistItem[]
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface TaskComment {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface TaskState {
  tasks: Task[]
  loading: boolean
  filters: {
    status: string
    priority: string
    assignee: string
    project: string
  }
}

export const useTaskStore = defineStore('tasks', {
  state: (): TaskState => ({
    tasks: [],
    loading: false,
    filters: {
      status: 'all',
      priority: 'all',
      assignee: 'all',
      project: 'all'
    }
  }),

  getters: {
    filteredTasks: (state) => {
      return state.tasks.filter(task => {
        if (state.filters.status !== 'all' && task.status !== state.filters.status) return false
        if (state.filters.priority !== 'all' && task.priority !== state.filters.priority) return false
        if (state.filters.assignee !== 'all' && !task.assignedTo.includes(state.filters.assignee)) return false
        if (state.filters.project !== 'all' && task.projectId !== state.filters.project) return false
        return true
      })
    },

    tasksByStatus: (state) => {
      const statusCounts = {
        pending: 0,
        'in-progress': 0,
        review: 0,
        completed: 0
      }
      
      state.tasks.forEach(task => {
        statusCounts[task.status]++
      })
      
      return statusCounts
    },

    tasksByPriority: (state) => {
      const priorityCounts = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      }
      
      state.tasks.forEach(task => {
        priorityCounts[task.priority]++
      })
      
      return priorityCounts
    },

    overdueTasks: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.tasks.filter(task => 
        task.status !== 'completed' && task.dueDate < today
      )
    },

    myTasks: (state) => {
      const authStore = useAuthStore()
      return state.tasks.filter(task => 
        task.assignedTo.includes(authStore.user?.name || '')
      )
    }
  },

  actions: {
    async fetchTasks() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock data
        this.tasks = [
          {
            id: '1',
            title: 'Análisis de procesos actuales',
            description: 'Revisar y documentar los procesos manufactureros actuales del cliente',
            projectId: '1',
            assignedTo: ['Ana García', 'Carlos López'],
            status: 'completed',
            priority: 'high',
            dueDate: '2024-02-10',
            createdAt: '2024-01-15',
            updatedAt: '2024-02-08',
            tags: ['análisis', 'procesos'],
            attachments: [],
            comments: [],
            checklist: [
              { id: '1', text: 'Entrevistar supervisores', completed: true },
              { id: '2', text: 'Mapear procesos críticos', completed: true },
              { id: '3', text: 'Documentar hallazgos', completed: true }
            ]
          },
          {
            id: '2',
            title: 'Diseño de herramientas de gestión',
            description: 'Crear las herramientas necesarias para el nuevo modelo de gestión',
            projectId: '1',
            assignedTo: ['María González'],
            status: 'in-progress',
            priority: 'high',
            dueDate: '2024-06-20',
            createdAt: '2024-03-01',
            updatedAt: '2024-06-15',
            tags: ['diseño', 'herramientas'],
            attachments: [],
            comments: [],
            checklist: [
              { id: '4', text: 'Dashboard de indicadores', completed: true },
              { id: '5', text: 'Formularios de captura', completed: false },
              { id: '6', text: 'Reportes automatizados', completed: false }
            ]
          },
          {
            id: '3',
            title: 'Capacitación equipo operativo',
            description: 'Entrenar al personal en las nuevas metodologías y herramientas',
            projectId: '1',
            assignedTo: ['Miguel Rico', 'Ana García'],
            status: 'pending',
            priority: 'medium',
            dueDate: '2024-06-25',
            createdAt: '2024-04-01',
            updatedAt: '2024-06-15',
            tags: ['capacitación', 'personal'],
            attachments: [],
            comments: [],
            checklist: []
          },
          {
            id: '4',
            title: 'Evaluación de tecnologías',
            description: 'Analizar las mejores opciones tecnológicas para la transformación digital',
            projectId: '2',
            assignedTo: ['Pedro Sánchez'],
            status: 'in-progress',
            priority: 'high',
            dueDate: '2024-06-30',
            createdAt: '2024-03-15',
            updatedAt: '2024-06-18',
            tags: ['tecnología', 'evaluación'],
            attachments: [],
            comments: [],
            checklist: []
          },
          {
            id: '5',
            title: 'Reunión semanal con cliente',
            description: 'Presentar avances y discutir próximos pasos',
            projectId: '1',
            assignedTo: ['Miguel Rico'],
            status: 'pending',
            priority: 'medium',
            dueDate: '2024-06-21',
            createdAt: '2024-06-18',
            updatedAt: '2024-06-18',
            tags: ['reunión', 'cliente'],
            attachments: [],
            comments: [],
            checklist: []
          }
        ]
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        this.loading = false
      }
    },

    async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      this.tasks.push(newTask)
      return newTask
    },

    async updateTask(taskId: string, updates: Partial<Task>) {
      const index = this.tasks.findIndex(t => t.id === taskId)
      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    },

    async deleteTask(taskId: string) {
      const index = this.tasks.findIndex(t => t.id === taskId)
      if (index !== -1) {
        this.tasks.splice(index, 1)
      }
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        status: 'all',
        priority: 'all',
        assignee: 'all',
        project: 'all'
      }
    }
  }
})
