import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DashboardPage from '~/pages/dashboard/index.vue'
import { useProjectStore } from '~/stores/project'

// Mock macros and composables
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('useAuth', () => ({
  logout: vi.fn()
}))

// Mock ProjectCard and CreateProjectModal to avoid mounting them fully
const ProjectCardStub = { template: '<div class="project-card-stub"></div>' }
const CreateProjectModalStub = { template: '<div class="create-project-modal-stub"></div>' }

describe('Dashboard Page', () => {
  const createButtonWithLimitTitleSelector = 'button[title*="límite"]'
  const emptyStateText = 'No hay proyectos'
  const errorStateText = 'Failed'

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Stub global components or imports if needed
    // In unit tests, components imported in script setup are locally available, so we stash them in stubs
  })

  it('fetches projects on mount', async () => {
  
    // We can spy on the store action before mounting
    // But since store is created inside component (useProjectStore), we need to ensure we spy on the same instance
    // or spy on the prototype/definition? No, Pinia stores are singletons per pinia instance.
    
    // Best way without createTestingPinia:
    // 1. Create pinia
    // 2. Use store
    // 3. Mock action
    // 4. Mount component
    
    const pinia = createPinia()
    setActivePinia(pinia)
    const projectStore = useProjectStore()
    projectStore.fetchProjects = vi.fn().mockResolvedValue([])

    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [pinia],
        stubs: {
          ProjectCard: ProjectCardStub,
          CreateProjectModal: CreateProjectModalStub
        }
      }
    })

    expect(projectStore.fetchProjects).toHaveBeenCalled()
  })

  it('shows create button disabled if canCreateProject is false', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const projectStore = useProjectStore()
    
    // Mock getter using defineProperty or just simple assignment if using Setup Store (ref/computed)
    // For Setup Stores, we can often replace the property if it's writable or we need to use `vi.spyOn` on the store object if it was an option store.
    // However, computed properties in Setup Stores are read-only refs typically.
    
    // Hack: mock the canCreateProject ref
    // @ts-ignore
    projectStore.canCreateProject = false // This might not work if it's a computed ref that is read-only.
    
    // If we can't write to it, we must ensure the *dependencies* make it false or mock the whole store.
    // Mocking the whole store module is often cleaner but we are already inside the test using real store logic.
    // Let's rely on setting state correctly.
    
    // Set user to free and active projects to limit
    const authStore = (await import('~/stores/auth')).useAuthStore()
    authStore.user = { subscription: 'FREE' } as any
    projectStore.projects = [
        { status: 'ACTIVE' }, { status: 'ACTIVE' }, { status: 'ACTIVE' }
    ] as any
    
    // Note: activeProjectsCount is computed, canCreateProject is computed. 
    // They should update automatically with real Pinia.
    
    const wrapper = mount(DashboardPage, {
        global: {
            plugins: [pinia],
            stubs: {
                ProjectCard: ProjectCardStub,
                CreateProjectModal: CreateProjectModalStub
            }
        }
    })
    const createBtn = wrapper.find(createButtonWithLimitTitleSelector)
    expect(createBtn.exists()).toBe(true)
    expect(createBtn.attributes()).toHaveProperty('disabled')
  })

  it('shows empty state when no projects', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [pinia],
        stubs: { ProjectCard: ProjectCardStub, CreateProjectModal: CreateProjectModalStub }
      }
    })
    
    expect(wrapper.text()).toContain(emptyStateText)
  })

  it('shows error state', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const projectStore = useProjectStore()
    projectStore.error = errorStateText
    
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [pinia],
        stubs: { ProjectCard: ProjectCardStub, CreateProjectModal: CreateProjectModalStub }
      }
    })
    
    expect(wrapper.text()).toContain(errorStateText)
  })
})
