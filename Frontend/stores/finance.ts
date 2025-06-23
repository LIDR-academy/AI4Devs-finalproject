import { defineStore } from 'pinia'

export interface Expense {
  id: string
  projectId: string
  consultantId: string
  consultantName: string
  category: 'transport' | 'accommodation' | 'meals' | 'materials' | 'other'
  amount: number
  description: string
  date: string
  receipt?: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  approvedBy?: string
  approvedAt?: string
  paidAt?: string
  notes?: string
}

export interface Viatic {
  id: string
  projectId: string
  consultantId: string
  consultantName: string
  weekStartDate: string
  weekEndDate: string
  amount: number
  status: 'pending' | 'approved' | 'paid'
  approvedBy?: string
  approvedAt?: string
  paidAt?: string
  isRemote: boolean
}

export interface FinanceState {
  expenses: Expense[]
  viatics: Viatic[]
  loading: boolean
  filters: {
    status: string
    category: string
    consultant: string
    project: string
    dateRange: {
      start: string
      end: string
    }
  }
}

export const useFinanceStore = defineStore('finance', {
  state: (): FinanceState => ({
    expenses: [],
    viatics: [],
    loading: false,
    filters: {
      status: 'all',
      category: 'all',
      consultant: 'all',
      project: 'all',
      dateRange: {
        start: '',
        end: ''
      }
    }
  }),

  getters: {
    filteredExpenses: (state) => {
      return state.expenses.filter(expense => {
        if (state.filters.status !== 'all' && expense.status !== state.filters.status) return false
        if (state.filters.category !== 'all' && expense.category !== state.filters.category) return false
        if (state.filters.consultant !== 'all' && expense.consultantName !== state.filters.consultant) return false
        if (state.filters.project !== 'all' && expense.projectId !== state.filters.project) return false
        if (state.filters.dateRange.start && expense.date < state.filters.dateRange.start) return false
        if (state.filters.dateRange.end && expense.date > state.filters.dateRange.end) return false
        return true
      })
    },

    filteredViatics: (state) => {
      return state.viatics.filter(viatic => {
        if (state.filters.status !== 'all' && viatic.status !== state.filters.status) return false
        if (state.filters.consultant !== 'all' && viatic.consultantName !== state.filters.consultant) return false
        if (state.filters.project !== 'all' && viatic.projectId !== state.filters.project) return false
        return true
      })
    },

    totalExpenses: (state) => {
      return state.expenses.reduce((total, expense) => total + expense.amount, 0)
    },

    totalViatics: (state) => {
      return state.viatics.reduce((total, viatic) => total + viatic.amount, 0)
    },

    expensesByCategory: (state) => {
      const categories = {
        transport: 0,
        accommodation: 0,
        meals: 0,
        materials: 0,
        other: 0
      }
      
      state.expenses.forEach(expense => {
        categories[expense.category] += expense.amount
      })
      
      return categories
    },

    expensesByStatus: (state) => {
      const statuses = {
        pending: 0,
        approved: 0,
        rejected: 0,
        paid: 0
      }
      
      state.expenses.forEach(expense => {
        statuses[expense.status]++
      })
      
      return statuses
    },

    viaticsByStatus: (state) => {
      const statuses = {
        pending: 0,
        approved: 0,
        paid: 0
      }
      
      state.viatics.forEach(viatic => {
        statuses[viatic.status]++
      })
      
      return statuses
    },

    monthlyExpenses: (state) => {
      const monthly: { [key: string]: number } = {}
      
      state.expenses.forEach(expense => {
        const month = expense.date.substring(0, 7) // YYYY-MM
        monthly[month] = (monthly[month] || 0) + expense.amount
      })
      
      return monthly
    }
  },

  actions: {
    async fetchExpenses() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock data
        this.expenses = [
          {
            id: '1',
            projectId: '1',
            consultantId: '1',
            consultantName: 'Ana García',
            category: 'transport',
            amount: 850,
            description: 'Viaje a planta manufacturera - Gasolina y casetas',
            date: '2024-06-15',
            status: 'approved',
            approvedBy: 'Miguel Rico',
            approvedAt: '2024-06-16'
          },
          {
            id: '2',
            projectId: '1',
            consultantId: '2',
            consultantName: 'Carlos López',
            category: 'accommodation',
            amount: 1200,
            description: 'Hotel para estadía de 2 noches',
            date: '2024-06-14',
            status: 'paid',
            approvedBy: 'Miguel Rico',
            approvedAt: '2024-06-15',
            paidAt: '2024-06-17'
          },
          {
            id: '3',
            projectId: '2',
            consultantId: '3',
            consultantName: 'Pedro Sánchez',
            category: 'materials',
            amount: 450,
            description: 'Material de oficina para capacitaciones',
            date: '2024-06-18',
            status: 'pending'
          },
          {
            id: '4',
            projectId: '1',
            consultantId: '1',
            consultantName: 'Ana García',
            category: 'meals',
            amount: 320,
            description: 'Comidas durante visita a cliente',
            date: '2024-06-19',
            status: 'pending'
          }
        ]
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchViatics() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 600))
        
        // Mock data
        this.viatics = [
          {
            id: '1',
            projectId: '1',
            consultantId: '1',
            consultantName: 'Ana García',
            weekStartDate: '2024-06-10',
            weekEndDate: '2024-06-14',
            amount: 1500,
            status: 'paid',
            approvedBy: 'Miguel Rico',
            approvedAt: '2024-06-15',
            paidAt: '2024-06-17',
            isRemote: false
          },
          {
            id: '2',
            projectId: '1',
            consultantId: '2',
            consultantName: 'Carlos López',
            weekStartDate: '2024-06-10',
            weekEndDate: '2024-06-14',
            amount: 1500,
            status: 'approved',
            approvedBy: 'Miguel Rico',
            approvedAt: '2024-06-16',
            isRemote: false
          },
          {
            id: '3',
            projectId: '2',
            consultantId: '3',
            consultantName: 'Pedro Sánchez',
            weekStartDate: '2024-06-17',
            weekEndDate: '2024-06-21',
            amount: 750,
            status: 'pending',
            isRemote: true
          },
          {
            id: '4',
            projectId: '1',
            consultantId: '4',
            consultantName: 'María González',
            weekStartDate: '2024-06-17',
            weekEndDate: '2024-06-21',
            amount: 1500,
            status: 'pending',
            isRemote: false
          }
        ]
      } catch (error) {
        console.error('Error fetching viatics:', error)
      } finally {
        this.loading = false
      }
    },

    async createExpense(expenseData: Omit<Expense, 'id'>) {
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString()
      }
      
      this.expenses.push(newExpense)
      return newExpense
    },

    async updateExpense(expenseId: string, updates: Partial<Expense>) {
      const index = this.expenses.findIndex(e => e.id === expenseId)
      if (index !== -1) {
        this.expenses[index] = { ...this.expenses[index], ...updates }
      }
    },

    async approveExpense(expenseId: string, approverName: string) {
      await this.updateExpense(expenseId, {
        status: 'approved',
        approvedBy: approverName,
        approvedAt: new Date().toISOString()
      })
    },

    async rejectExpense(expenseId: string, notes: string) {
      await this.updateExpense(expenseId, {
        status: 'rejected',
        notes
      })
    },

    async payExpense(expenseId: string) {
      await this.updateExpense(expenseId, {
        status: 'paid',
        paidAt: new Date().toISOString()
      })
    },

    async createViatic(viaticData: Omit<Viatic, 'id'>) {
      const newViatic: Viatic = {
        ...viaticData,
        id: Date.now().toString()
      }
      
      this.viatics.push(newViatic)
      return newViatic
    },

    async updateViatic(viaticId: string, updates: Partial<Viatic>) {
      const index = this.viatics.findIndex(v => v.id === viaticId)
      if (index !== -1) {
        this.viatics[index] = { ...this.viatics[index], ...updates }
      }
    },

    async approveViatic(viaticId: string, approverName: string) {
      await this.updateViatic(viaticId, {
        status: 'approved',
        approvedBy: approverName,
        approvedAt: new Date().toISOString()
      })
    },

    async payViatic(viaticId: string) {
      await this.updateViatic(viaticId, {
        status: 'paid',
        paidAt: new Date().toISOString()
      })
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        status: 'all',
        category: 'all',
        consultant: 'all',
        project: 'all',
        dateRange: {
          start: '',
          end: ''
        }
      }
    }
  }
})
