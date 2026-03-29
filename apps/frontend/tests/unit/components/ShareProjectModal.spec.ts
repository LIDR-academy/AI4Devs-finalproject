import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ShareProjectModal from '~/components/projects/ShareProjectModal.vue';
import { setActivePinia, createPinia } from 'pinia';

// Mock stores
vi.mock('~/stores/toast', () => ({
  useToastStore: () => ({
    add: vi.fn()
  })
}));

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    token: { value: 'test-token' }
  })
}));

// Mock UiModal
vi.mock('~/components/common/UiModal.vue', () => ({
  default: {
    name: 'UiModal',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div v-if="modelValue"><slot name="title" /><slot /><slot name="footer" /></div>'
  }
}));

// Mock $fetch
global.$fetch = vi.fn();

// Mock useRuntimeConfig
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:4000/api'
    }
  })
}));

describe('ShareProjectModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should render when modelValue is true', () => {
    const wrapper = mount(ShareProjectModal, {
      props: {
        modelValue: true,
        projectId: 'proj-123'
      }
    });

    expect(wrapper.text()).toContain('Compartir Proyecto');
  });

  it('should not render when modelValue is false', () => {
    const wrapper = mount(ShareProjectModal, {
      props: {
        modelValue: false,
        projectId: 'proj-123'
      }
    });

    expect(wrapper.text()).not.toContain('Compartir Proyecto');
  });

  it('should load share status when modal opens', async () => {
    vi.mocked($fetch).mockResolvedValueOnce([
      {
        id: '1',
        projectId: 'proj-123',
        email: 'guest@system',
        token: 'abc123',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    // Mount with modelValue false first
    const wrapper = mount(ShareProjectModal, {
      props: {
        modelValue: false,
        projectId: 'proj-123'
      }
    });

    // Then change to true to trigger the watch
    await wrapper.setProps({ modelValue: true });
    await wrapper.vm.$nextTick();
    
    // Wait for the async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    expect($fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-123/invitations'),
      expect.any(Object)
    );
  });

  it('should handle 404 when share is not active', async () => {
    vi.mocked($fetch).mockRejectedValueOnce({
      status: 404
    });

    const wrapper = mount(ShareProjectModal, {
      props: {
        modelValue: true,
        projectId: 'proj-123'
      }
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should not show error for 404
    expect(wrapper.text()).not.toContain('Error al cargar');
  });
});
