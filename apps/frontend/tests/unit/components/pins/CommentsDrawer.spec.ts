import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CommentsDrawer from '~/components/pins/CommentsDrawer.vue';
import type { Pin } from '~/types/pin';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '1 de enero, 2024'),
  formatDistanceToNow: vi.fn(() => 'hace 2 horas'),
}));

vi.mock('date-fns/locale', () => ({
  es: {}
}));

// Stub component
const UiButtonStub = {
  name: 'UiButton',
  props: ['variant', 'loading', 'disabled'],
  template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'
};

describe('CommentsDrawer', () => {
  const mockPin: Pin = {
    id: '1',
    layerId: 'layer1',
    xCoord: 0.5,
    yCoord: 0.3,
    status: 'OPEN',
    createdBy: 'user1',
    guestName: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: [
      {
        id: 'c1',
        pinId: '1',
        content: 'Primer comentario',
        authorId: 'user1',
        guestName: null,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'c2',
        pinId: '1',
        content: 'Segundo comentario',
        authorId: null,
        guestName: 'Invitado',
        createdAt: '2024-01-01T01:00:00Z'
      }
    ]
  };

  it('should render comments list', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const comments = wrapper.findAll('.bg-gray-50');
    expect(comments.length).toBe(2);
    expect(wrapper.text()).toContain('Primer comentario');
    expect(wrapper.text()).toContain('Segundo comentario');
  });

  it('should display author names correctly', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Invitado');
  });

  it('should show resolved badge when status is RESOLVED', async () => {
    const resolvedPin = { ...mockPin, status: 'RESOLVED' as const };
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: resolvedPin
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Resuelto');
  });

  it('should emit add-comment event', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Nuevo comentario');

    const buttons = wrapper.findAllComponents(UiButtonStub);
    const sendButton = buttons.find(b => b.text() === 'Enviar');
    await sendButton?.trigger('click');

    expect(wrapper.emitted('add-comment')).toBeTruthy();
    expect(wrapper.emitted('add-comment')?.[0]).toEqual(['Nuevo comentario']);
  });

  it('should disable send button when textarea is empty', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const buttons = wrapper.findAllComponents(UiButtonStub);
    const sendButton = buttons.find(b => b.text() === 'Enviar');
    expect(sendButton?.props('disabled')).toBe(true);
  });

  it('should show resolve button only when canResolve is true', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin,
        canResolve: true
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const buttons = wrapper.findAllComponents(UiButtonStub);
    const resolveButton = buttons.find(b => 
      b.text() === 'Resolver' || b.text() === 'Reabrir'
    );
    expect(resolveButton).toBeDefined();
  });

  it('should not show resolve button when canResolve is false', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin,
        canResolve: false
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const buttons = wrapper.findAllComponents(UiButtonStub);
    const resolveButton = buttons.find(b => 
      b.text() === 'Resolver' || b.text() === 'Reabrir'
    );
    expect(resolveButton).toBeUndefined();
  });

  it('should emit toggle-status event', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin,
        canResolve: true
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const buttons = wrapper.findAllComponents(UiButtonStub);
    const resolveButton = buttons.find(b => b.text() === 'Resolver');
    await resolveButton?.trigger('click');

    expect(wrapper.emitted('toggle-status')).toBeTruthy();
  });

  it('should emit close on backdrop click', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const backdrop = wrapper.find('.bg-black.bg-opacity-30');
    await backdrop.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('should clear textarea after emitting add-comment', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      global: {
        stubs: {
          Teleport: true,
          UiButton: UiButtonStub
        }
      }
    });

    await flushPromises();

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Test comment');
    await flushPromises();

    const buttons = wrapper.findAllComponents(UiButtonStub);
    const sendButton = buttons.find(b => b.text() === 'Enviar');
    await sendButton?.trigger('click');
    
    await wrapper.vm.$nextTick();
    await flushPromises();

    // Verify the emit happened
    expect(wrapper.emitted('add-comment')).toBeTruthy();
    
    // Check the textarea was cleared by checking the value
    expect(wrapper.find('textarea').element.value).toBe('');
  });
});
