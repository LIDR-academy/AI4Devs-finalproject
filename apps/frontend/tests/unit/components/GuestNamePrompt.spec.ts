import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import GuestNamePrompt from '~/components/guest/GuestNamePrompt.vue';

// Mock UiModal y UiInput
vi.mock('~/components/common/UiModal.vue', () => ({
  default: {
    name: 'UiModal',
    template: '<div><slot name="title" /><slot /><slot name="footer" /></div>'
  }
}));

vi.mock('~/components/common/UiInput.vue', () => ({
  default: {
    name: 'UiInput',
    props: ['modelValue', 'label', 'placeholder', 'errorMessage'],
    emits: ['update:modelValue', 'keyup.enter'],
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup.enter\')" />'
  }
}));

describe('GuestNamePrompt', () => {
  it('should render correctly', () => {
    const wrapper = mount(GuestNamePrompt);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('should validate minimum name length', async () => {
    const wrapper = mount(GuestNamePrompt);
    const input = wrapper.find('input');
    const button = wrapper.find('button[type="button"]');

    // Nombre muy corto
    await input.setValue('A');
    await wrapper.vm.$nextTick();
    expect(button.attributes('disabled')).toBeDefined();

    // Nombre válido
    await input.setValue('John Doe');
    await wrapper.vm.$nextTick();
    expect(button.attributes('disabled')).toBeUndefined();
  });

  it('should emit submit event with valid name', async () => {
    const wrapper = mount(GuestNamePrompt);
    const input = wrapper.find('input');
    const button = wrapper.find('button[type="button"]');

    await input.setValue('Jane Smith');
    await button.trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')?.[0]).toEqual(['Jane Smith']);
  });

  it('should not emit submit with invalid name', async () => {
    const wrapper = mount(GuestNamePrompt);
    const input = wrapper.find('input');
    const button = wrapper.find('button[type="button"]');

    await input.setValue('A');
    await button.trigger('click');

    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('should trim whitespace from name', async () => {
    const wrapper = mount(GuestNamePrompt);
    const input = wrapper.find('input');
    const button = wrapper.find('button[type="button"]');

    await input.setValue('  John Doe  ');
    await button.trigger('click');

    expect(wrapper.emitted('submit')?.[0]).toEqual(['John Doe']);
  });
});
