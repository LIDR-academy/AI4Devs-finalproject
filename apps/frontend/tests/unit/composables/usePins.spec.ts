import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePins } from '~/composables/usePins';

// Mock $fetch
global.$fetch = vi.fn();

// Mock stores
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'auth-token',
    isAuthenticated: true
  }))
}));

vi.mock('~/stores/guest', () => ({
  useGuestStore: vi.fn(() => ({
    guestToken: null,
    isGuest: false
  }))
}));

vi.mock('~/stores/toast', () => ({
  useToastStore: vi.fn(() => ({
    add: vi.fn()
  }))
}));

// Mock runtime config
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:4000/api'
    }
  })
}));

describe('usePins', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { pins, selectedPin, loading, error } = usePins();

    expect(pins.value).toEqual([]);
    expect(selectedPin.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('should fetch pins by layer', async () => {
    const mockPins = [
      { id: '1', layerId: 'layer1', xCoord: 0.5, yCoord: 0.3, status: 'OPEN' }
    ];

    (global.$fetch as any).mockResolvedValueOnce({ pins: mockPins });

    const { fetchPinsByLayer, pins } = usePins();
    await fetchPinsByLayer('layer1');

    expect(pins.value).toEqual(mockPins);
    expect(global.$fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/layers/layer1/pins',
      expect.objectContaining({
        headers: { Authorization: 'Bearer auth-token' }
      })
    );
  });

  it('should create pin', async () => {
    const mockPin = {
      id: '1',
      layerId: 'layer1',
      xCoord: 0.5,
      yCoord: 0.3,
      status: 'OPEN',
      comments: [{ id: 'c1', content: 'Test' }]
    };

    (global.$fetch as any).mockResolvedValueOnce(mockPin);

    const { createPin, pins } = usePins();
    const result = await createPin('layer1', {
      xCoord: 0.5,
      yCoord: 0.3,
      content: 'Test comment'
    });

    expect(result).toEqual(mockPin);
    expect(pins.value).toContainEqual(mockPin);
  });

  it('should update pin status', async () => {
    const { updatePinStatus, pins } = usePins();
    
    pins.value = [
      { id: '1', layerId: 'layer1', xCoord: 0.5, yCoord: 0.3, status: 'OPEN', createdBy: 'user1', guestName: null, createdAt: '', updatedAt: '' }
    ];

    (global.$fetch as any).mockResolvedValueOnce({
      id: '1',
      status: 'RESOLVED',
      updatedAt: '2024-01-01T00:00:00Z'
    });

    await updatePinStatus('1', { status: 'RESOLVED' });

    expect(pins.value[0].status).toBe('RESOLVED');
  });

  it('should compute canResolve correctly', () => {
    const { canResolve } = usePins();
    
    // Should be true for non-guest authenticated users
    expect(canResolve.value).toBe(true);
  });
});
