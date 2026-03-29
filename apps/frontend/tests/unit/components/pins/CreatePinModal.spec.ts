import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CreatePinModal from '~/components/pins/CreatePinModal.vue';

// Mock components
vi.mock('~/components/common/UiModal.vue', () => ({
  default: {
    name: 'UiModal',
    template: '<div><slot name="title" /><slot /><slot name="footer" /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue']
  }
}));

vi.mock('~/components/common/UiInput.vue', () => ({
  default: {
    name: 'UiInput',
    props: ['modelValue', 'label', 'placeholder', 'errorMessage', 'type', 'rows'],
    emits: ['update:modelValue'],
    template: '<textarea v-if="type === \'textarea\'" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><input v-else :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  }
}));

vi.mock('~/components/common/UiButton.vue', () => ({
  default: {
    name: 'UiButton',
    props: ['variant', 'loading', 'disabled'],
    template: '<button :disabled="disabled"><slot /></button>'
  }
}));

describe('CreatePinModal', () => {
  const mockCoords = { x: 0.5, y: 0.3 };

  it('should render correctly', () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('should validate minimum content length', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const textarea = wrapper.find('textarea');
    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Crear'));

    // Content muy corto
    await textarea.setValue('Ab');
    await wrapper.vm.$nextTick();
    expect(submitButton?.attributes('disabled')).toBeDefined();

    // Content válido
    await textarea.setValue('Este es un comentario válido');
    await wrapper.vm.$nextTick();
    expect(submitButton?.attributes('disabled')).toBeUndefined();
  });

  it('should emit submit with trimmed content', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('  Test comment  ');
    
    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Crear'));
    await submitButton?.trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')?.[0]).toEqual(['Test comment']);
  });

  it('should display coordinates info', () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const text = wrapper.text();
    expect(text).toContain('X: 50%');
    expect(text).toContain('Y: 30%');
  });

  it('should reset content when modal closes', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Some content');

    // Cerrar modal
    await wrapper.setProps({ modelValue: false });
    await wrapper.vm.$nextTick();

    // Reabrir
    await wrapper.setProps({ modelValue: true });
    await wrapper.vm.$nextTick();

    expect(textarea.element.value).toBe('');
  });

  it('should emit close on cancel button', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const cancelButton = wrapper.findAll('button').find(b => b.text().includes('Cancelar'));
    await cancelButton?.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
