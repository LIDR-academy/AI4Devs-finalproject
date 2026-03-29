import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import UiInput from '~/components/common/UiInput.vue'

const mockValue = ref('')
const mockErrorMessage = ref('')

vi.mock('vee-validate', () => ({
  useField: () => ({
    value: mockValue,
    errorMessage: mockErrorMessage,
  })
}))

describe('UiInput', () => {
  const errorBorderClass = 'border-red-500'

  beforeEach(() => {
    mockValue.value = ''
    mockErrorMessage.value = ''
  })

  it('renders label correctly', () => {
    const wrapper = mount(UiInput, {
      props: {
        name: 'test-input',
        label: 'Test Label'
      }
    })
    expect(wrapper.find('label').text()).toBe('Test Label')
  })

  it('renders placeholder correctly', () => {
    const wrapper = mount(UiInput, {
      props: {
        name: 'test-input',
        placeholder: 'Enter text'
      }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
  })

  it('displays error message when present', async () => {
    const wrapper = mount(UiInput, {
      props: {
        name: 'test-input'
      }
    })
    
    mockErrorMessage.value = 'Invalid input'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Invalid input')
    const input = wrapper.find('input')
    expect(input.classes()).toContain(errorBorderClass)
  })

  it('binds input value to useField value', async () => {
    const wrapper = mount(UiInput, {
      props: {
        name: 'test-input'
      }
    })
    
    const input = wrapper.find('input')
    await input.setValue('hello')
    
    expect(mockValue.value).toBe('hello')
  })
})
