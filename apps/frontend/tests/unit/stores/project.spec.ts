import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectStore } from '~/stores/project'
import { useAuthStore } from '~/stores/auth'
import { PROJECT_LIMITS } from '~/types/project'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { apiBase: 'http://localhost:3000' }
}))

// Mock $fetch
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

describe('Project Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
  })

  it('initializes with default state', () => {
    const store = useProjectStore()
    expect(store.projects).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  describe('Getters', () => {
    it('activeProjectsCount filters out deleted or archived projects', () => {
      const store = useProjectStore()
      store.projects = [
        { id: '1', status: 'ACTIVE', deletedAt: null },
        { id: '2', status: 'ARCHIVED', deletedAt: null },
        { id: '3', status: 'ACTIVE', deletedAt: '2023-01-01' },
        { id: '4', status: 'ACTIVE', deletedAt: null }
      ] as any

      expect(store.activeProjectsCount).toBe(2)
    })

    describe('canCreateProject', () => {
      it('returns false if user is not authenticated', () => {
        const store = useProjectStore()
        const authStore = useAuthStore()
        authStore.user = null
        expect(store.canCreateProject).toBe(false)
      })

      it('FREE plan: returns true if active projects < limit', () => {
        const store = useProjectStore()
        const authStore = useAuthStore()
        authStore.user = { subscription: 'FREE' } as any
        
        // Mock 2 active projects (Limit is 3)
        store.projects = [
          { status: 'ACTIVE' }, { status: 'ACTIVE' }
        ] as any

        expect(store.canCreateProject).toBe(true)
      })

      it('FREE plan: returns false if active projects >= limit', () => {
        const store = useProjectStore()
        const authStore = useAuthStore()
        authStore.user = { subscription: 'FREE' } as any
        
        // Mock 3 active projects
        store.projects = [
          { status: 'ACTIVE' }, { status: 'ACTIVE' }, { status: 'ACTIVE' }
        ] as any

        expect(store.canCreateProject).toBe(false)
      })

      it('returns true for verify non-FREE plans', () => {
        const store = useProjectStore()
        const authStore = useAuthStore()
        authStore.user = { subscription: 'PREMIUM' } as any
        
        // Even with many projects
        store.projects = Array(10).fill({ status: 'ACTIVE' }) as any

        expect(store.canCreateProject).toBe(true)
      })
    })
  })

  describe('Actions', () => {
    describe('fetchProjects', () => {
      it('fetches projects successfully', async () => {
        const store = useProjectStore()
        const authStore = useAuthStore()
        authStore.token = 'test-token'
        
        const mockProjects = [{ id: '1', title: 'Test' }]
        fetchMock.mockResolvedValue(mockProjects)
        
        const promise = store.fetchProjects()
        expect(store.loading).toBe(true)
        await promise
        
        expect(store.projects).toEqual(mockProjects)
        expect(store.loading).toBe(false)
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/projects'), 
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer test-token'
                })
            })
        )
      })

      it('handles fetch error', async () => {
        const store = useProjectStore()
        const errorMessage = 'Network Error'
        fetchMock.mockRejectedValue({ message: errorMessage })
        
        await store.fetchProjects()
        
        expect(store.error).toBe(errorMessage)
        expect(store.loading).toBe(false)
      })
    })

    describe('createProject', () => {
      it('creates project successfully', async () => {
        const store = useProjectStore()
        const authStore = useAuthStore()
        authStore.token = 'test-token'
        
        const newProject = { title: 'New Project' }
        const createdProject = { id: '1', ...newProject }
        fetchMock.mockResolvedValue(createdProject)
        
        await store.createProject(newProject)
        
        expect(store.projects).toContainEqual(createdProject)
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/projects'), 
            expect.objectContaining({
                method: 'POST',
                body: newProject,
                headers: expect.objectContaining({
                     Authorization: 'Bearer test-token'
                })
            })
        )
      })

      it('handles create error', async () => {
        const store = useProjectStore()
        fetchMock.mockRejectedValue({ message: 'Error creating' })
        
        await expect(store.createProject({ title: 'Fail' })).rejects.toThrow()
        expect(store.error).toBeTruthy()
        expect(store.loading).toBe(false)
      })
    })
  })
})
