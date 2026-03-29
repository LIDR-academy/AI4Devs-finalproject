import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGuestAuth } from '~/composables/useGuestAuth';
import { useGuestStore } from '~/stores/guest';

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

describe('useGuestAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should login as guest successfully', async () => {
    const mockResponse = {
      accessToken: 'jwt-token',
      project: { id: 'proj-123', title: 'Test Project' }
    };

    vi.mocked($fetch).mockResolvedValueOnce(mockResponse);

    const { loginAsGuest } = useGuestAuth();
    const store = useGuestStore();

    await loginAsGuest('share-token-123');

    expect($fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/guest/login'),
      expect.objectContaining({
        method: 'POST',
        body: { token: 'share-token-123' }
      })
    );

    expect(store.guestToken).toBe('jwt-token');
  });

  it('should handle login error', async () => {
    vi.mocked($fetch).mockRejectedValueOnce({
      data: { message: 'Invalid token' }
    });

    const { loginAsGuest, error } = useGuestAuth();

    await expect(loginAsGuest('bad-token')).rejects.toThrow('Invalid token');
    expect(error.value).toBe('Invalid token');
  });

  it('should handle login error without message', async () => {
    vi.mocked($fetch).mockRejectedValueOnce({});

    const { loginAsGuest, error } = useGuestAuth();

    await expect(loginAsGuest('bad-token')).rejects.toThrow('Enlace inválido o expirado');
    expect(error.value).toBe('Enlace inválido o expirado');
  });

  it('should set guest name and persist', () => {
    const { setGuestName } = useGuestAuth();
    const store = useGuestStore();
    store.setGuestToken('token-123');

    setGuestName('Jane Doe', 'proj-456');

    if (typeof window !== 'undefined') {
      expect(localStorage.getItem('guest_name')).toBe('Jane Doe');
    }
    expect(store.guestUser?.name).toBe('Jane Doe');
    expect(store.guestUser?.projectId).toBe('proj-456');
  });

  it('should logout and clear guest state', () => {
    const { logout } = useGuestAuth();
    const store = useGuestStore();
    
    store.setGuestToken('token');
    store.setGuestUser({
      name: 'Test',
      projectId: '123',
      token: 'token',
      role: 'GUEST'
    });

    logout();

    expect(store.guestUser).toBeNull();
    expect(store.guestToken).toBeNull();
  });

  it('should set loading state during login', async () => {
    const mockResponse = {
      accessToken: 'jwt-token',
      project: { id: 'proj-123', title: 'Test Project' }
    };

    vi.mocked($fetch).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    const { loginAsGuest, loading } = useGuestAuth();

    const promise = loginAsGuest('token');
    expect(loading.value).toBe(true);

    await promise;
    expect(loading.value).toBe(false);
  });
});
