import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '~/components/projects/ProjectCard.vue'
import type { Project } from '~/types/project'

describe('ProjectCard.vue', () => {
  const statusBadgeSelector = '.rounded-full'
  const activeStatusClass = 'bg-green-100'
  const archivedStatusClass = 'bg-secondary/20'
  const defaultDescriptionText = 'Sin descripción'

  const mockProject: Project = {
    id: '1',
    title: 'Test Project',
    description: 'A description',
    status: 'ACTIVE',
    architectId: 'user1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  }

  it('renders title and description', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject }
    })
    
    expect(wrapper.text()).toContain('Test Project')
    expect(wrapper.text()).toContain('A description')
  })

  it('renders default description if missing', () => {
    const wrapper = mount(ProjectCard, {
      props: { 
        project: { ...mockProject, description: undefined } 
      }
    })
    expect(wrapper.text()).toContain(defaultDescriptionText)
  })

  it('renders correct status styles for ACTIVE', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject }
    })
    
    const statusBadge = wrapper.find(statusBadgeSelector) // Targeting the badge
    expect(statusBadge.text()).toBe('ACTIVE')
    expect(statusBadge.classes()).toContain(activeStatusClass)
    expect(statusBadge.classes()).toContain('text-green-800')
  })

  it('renders correct status styles for other status', () => {
    const wrapper = mount(ProjectCard, {
      props: { 
        project: { ...mockProject, status: 'ARCHIVED' } 
      }
    })
    
    const statusBadge = wrapper.find(statusBadgeSelector)
    expect(statusBadge.text()).toBe('ARCHIVED')
    expect(statusBadge.classes()).toContain(archivedStatusClass)
  })

  it('formats date correctly', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject }
    })
    
    // Dependent on locale, simplified check
    expect(wrapper.text()).toContain('Actualizado:')
    // Check if it's not showing raw ISO string
    expect(wrapper.text()).not.toContain('2023-01-02T00:00:00Z')
  })
})
