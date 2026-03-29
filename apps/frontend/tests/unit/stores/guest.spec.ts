import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGuestStore } from '~/stores/guest';

describe('Guest Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should set guest user', () => {
    const store = useGuestStore();
    const mockUser = {
      name: 'Test Guest',
      projectId: '123',
      token: 'abc',
      role: 'GUEST' as const
    };

    store.setGuestUser(mockUser);
    expect(store.guestUser).toEqual(mockUser);
  });

  it('should set guest token', () => {
    const store = useGuestStore();
    store.setGuestToken('test-token');
    expect(store.guestToken).toBe('test-token');
  });

  it('should compute isGuest correctly when no token', () => {
    const store = useGuestStore();
    expect(store.isGuest).toBe(false);
  });

  it('should compute isGuest correctly when token and user exist', () => {
    const store = useGuestStore();
    store.setGuestToken('test-token');
    store.setGuestUser({
      name: 'Test',
      projectId: '123',
      token: 'test-token',
      role: 'GUEST'
    });

    expect(store.isGuest).toBe(true);
  });

  it('should save and retrieve guest name from localStorage', () => {
    const store = useGuestStore();
    const testName = 'John Doe';

    store.saveGuestName(testName);
    
    if (typeof window !== 'undefined') {
      expect(localStorage.getItem('guest_name')).toBe(testName);
      expect(store.getPersistedGuestName()).toBe(testName);
    }
  });

  it('should clear guest state', () => {
    const store = useGuestStore();
    store.setGuestToken('token');
    store.setGuestUser({
      name: 'Test',
      projectId: '123',
      token: 'token',
      role: 'GUEST'
    });

    store.clearGuest();
    expect(store.guestUser).toBeNull();
    expect(store.guestToken).toBeNull();
  });

  it('should return null when getting persisted name without localStorage', () => {
    const store = useGuestStore();
    if (typeof window === 'undefined') {
      expect(store.getPersistedGuestName()).toBeNull();
    }
  });
});
