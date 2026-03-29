import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CreateProjectModal from '~/components/projects/CreateProjectModal.vue'
import { useProjectStore } from '~/stores/project'

describe('CreateProjectModal.vue', () => {
  const modalTitleText = 'Nuevo Proyecto'
  const requiredTitleErrorText = 'El título es obligatorio'
  const backendErrorMessage = 'Backend Error'

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('does not render when modelValue is false', () => {
    const wrapper = mount(CreateProjectModal, {
      props: { modelValue: false }
    })
    
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('renders when modelValue is true', () => {
    const wrapper = mount(CreateProjectModal, {
      props: { modelValue: true }
    })
    
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).toContain(modalTitleText)
  })

  it('visualizes error on empty title submit', async () => {
    const wrapper = mount(CreateProjectModal, {
      props: { modelValue: true }
    })
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain(requiredTitleErrorText)
  })

  it('calls createProject on valid submit', async () => {
    const wrapper = mount(CreateProjectModal, {
      props: { modelValue: true }
    })

    const store = useProjectStore()
    // Mock the action implementation manually
    store.createProject = vi.fn().mockResolvedValue({})

    const titleInput = wrapper.findAll('input')[0] // Assuming first input is title
    const descInput = wrapper.find('textarea')
    
    await titleInput.setValue('My New Project')
    await descInput.setValue('Desc')
    
    await wrapper.find('form').trigger('submit')
    
    expect(store.createProject).toHaveBeenCalledWith({
      title: 'My New Project',
      description: 'Desc'
    })
    
    // Check emits
    expect(wrapper.emitted()).toHaveProperty('success')
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([false])
  })

  it('shows error message from store', async () => {
    const wrapper = mount(CreateProjectModal, {
      props: { modelValue: true }
    })

    const store = useProjectStore()
    store.createProject = vi.fn().mockRejectedValue(new Error(backendErrorMessage))
    
    await wrapper.find('input').setValue('Title')
    await wrapper.find('form').trigger('submit')
    
    // Wait for promise
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Should show error div
    expect(wrapper.text()).toContain(backendErrorMessage)
  })
})
