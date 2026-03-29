import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRealtimeLayers } from '~/composables/useRealtimeLayers';
import { createPinia, setActivePinia } from 'pinia';

// Mock useNuxtApp
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $socket: mockSocket,
  }),
}));

// Mock vue lifecycle hooks
const lifecycleHooks = {
  onMounted: [] as Function[],
  onUnmounted: [] as Function[],
};

vi.mock('vue', async (importOriginal) => {
  const original = await importOriginal() as any;
  return {
    ...original,
    onMounted: (fn: Function) => lifecycleHooks.onMounted.push(fn),
    onUnmounted: (fn: Function) => lifecycleHooks.onUnmounted.push(fn),
  };
});

describe('useRealtimeLayers', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    lifecycleHooks.onMounted = [];
    lifecycleHooks.onUnmounted = [];
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
  });

  it('registers socket listeners on mount', () => {
    useRealtimeLayers();
    
    // Simulate mount
    lifecycleHooks.onMounted.forEach(fn => fn());

    expect(mockSocket.on).toHaveBeenCalledWith('layer:processed', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('layer:error', expect.any(Function));
  });

  it('unregisters socket listeners on unmount', () => {
    useRealtimeLayers();
    
    // Simulate mount then unmount
    lifecycleHooks.onMounted.forEach(fn => fn());
    lifecycleHooks.onUnmounted.forEach(fn => fn());

    expect(mockSocket.off).toHaveBeenCalledWith('layer:processed', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('layer:error', expect.any(Function));
  });
});
