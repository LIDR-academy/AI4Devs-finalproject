import { setActivePinia, createPinia } from 'pinia';
import { useToastStore, ToastItem } from '~/stores/toast';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Toast Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds a toast', () => {
    const store = useToastStore();
    store.add({ type: 'success', message: 'Test message' });
    
    expect(store.items).toHaveLength(1);
    expect(store.items[0].message).toBe('Test message');
    expect(store.items[0].type).toBe('success');
  });

  it('removes a toast', () => {
    const store = useToastStore();
    store.add({ type: 'success', message: 'Test message' });
    const id = store.items[0].id;
    
    store.remove(id);
    expect(store.items).toHaveLength(0);
  });

  it('removes toast automatically after duration', () => {
    vi.useFakeTimers();
    const store = useToastStore();
    
    store.add({ type: 'success', message: 'Test message', duration: 1000 });
    expect(store.items).toHaveLength(1);
    
    vi.advanceTimersByTime(1000);
    expect(store.items).toHaveLength(0);

    vi.useRealTimers();
  });
});
