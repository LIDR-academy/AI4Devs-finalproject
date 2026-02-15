/**
 * Tests for useBlockStatusListener Hook (T-031-FRONT)
 * 
 * Tests the custom React hook for subscribing to block status changes via Supabase Realtime.
 * Phase: TDD-GREEN (implementation uses standard imports with vi.mock)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { BlockStatus } from '../types/validation';
import type { BlockRealtimePayload } from '../types/realtime';
import { useBlockStatusListener } from '../hooks/useBlockStatusListener';
import { showStatusNotification } from '../services/notification.service';

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

const mockSupabaseClient = {
  channel: vi.fn(() => mockChannel),
};

// Mock modules
vi.mock('../services/supabase.client', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

vi.mock('../services/notification.service', () => ({
  showStatusNotification: vi.fn(),
}));

describe('useBlockStatusListener Hook', () => {
  const mockBlockId = '550e8400-e29b-41d4-a716-446655440000';
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockChannel.subscribe.mockImplementation((callback) => {
      // Simulate successful subscription
      callback('SUBSCRIBED');
      return mockChannel;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization and Connection', () => {
    it('should subscribe to Supabase Realtime channel on mount', async () => {
      // Given: Valid block ID
      
      // When: Hook is rendered
      const { result } = renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // Then: Should create channel with correct name
      await waitFor(() => {
        expect(mockSupabaseClient.channel).toHaveBeenCalledWith(`block-${mockBlockId}`);
      });

      // And: Should configure postgres_changes listener
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'UPDATE',
          schema: 'public',
          table: 'blocks',
          filter: `id=eq.${mockBlockId}`,
        }),
        expect.any(Function)
      );

      // And: Should subscribe to channel
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should set isConnected to true after successful subscription', async () => {
      // Given: Hook with valid block ID
      
      // When: Hook is rendered and subscription succeeds
      const { result } = renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // Then: Should eventually be connected
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // And: Should not be loading
      expect(result.current.isLoading).toBe(false);

      // And: Should not have error
      expect(result.current.error).toBeNull();
    });

    it('should set error state if subscription fails', async () => {
      // Given: Subscription that fails
      mockChannel.subscribe.mockImplementation((callback) => {
        callback('CHANNEL_ERROR');
        return mockChannel;
      });
      
const { result } = renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // Then: Should set error state
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // And: Should not be connected
      expect(result.current.isConnected).toBe(false);

      // And: Should not be loading
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle subscription timeout', async () => {
      // Given: Subscription that times out
      mockChannel.subscribe.mockImplementation((callback) => {
        callback('TIMED_OUT');
        return mockChannel;
      });
      
      // When: Hook is rendered
      const { result } = renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // Then: Should set error with timeout message
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.message).toContain('timeout');
      });
    });
  });

  describe('Status Change Detection', () => {
    it('should trigger toast notification when status changes from processing to validated', async () => {
      // Given: Hook and notification service
      
      let eventHandler: ((payload: BlockRealtimePayload) => void) | null = null;
      mockChannel.on.mockImplementation((event, config, handler) => {
        eventHandler = handler;
        return mockChannel;
      });

      // When: Hook is rendered
      renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // And: Status change event is received
      const payload: BlockRealtimePayload = {
        eventType: 'UPDATE',
        new: {
          id: mockBlockId,
          iso_code: 'SF-C12-M-001',
          status: 'validated' as BlockStatus,
          validation_report: null,
          created_at: '2026-02-15T12:00:00Z',
          updated_at: '2026-02-15T12:05:00Z',
        },
        old: {
          id: mockBlockId,
          status: 'processing' as BlockStatus,
        },
      };

      eventHandler?.(payload);

      // Then: Should show success notification
      await waitFor(() => {
        expect(showStatusNotification).toHaveBeenCalledWith(
          'processing_to_validated',
          'SF-C12-M-001'
        );
      });
    });

    it('should trigger toast notification when status changes from processing to rejected', async () => {
      // Given: Hook setup
      
      let eventHandler: ((payload: BlockRealtimePayload) => void) | null = null;
      mockChannel.on.mockImplementation((event, config, handler) => {
        eventHandler = handler;
        return mockChannel;
      });

      // When: Hook is rendered
      renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // And: Rejection event is received
      const payload: BlockRealtimePayload = {
        eventType: 'UPDATE',
        new: {
          id: mockBlockId,
          iso_code: 'SF-C12-M-002',
          status: 'rejected' as BlockStatus,
          validation_report: null,
          created_at: '2026-02-15T12:00:00Z',
          updated_at: '2026-02-15T12:05:00Z',
        },
        old: {
          id: mockBlockId,
          status: 'processing' as BlockStatus,
        },
      };

      eventHandler?.(payload);

      // Then: Should show error notification
      await waitFor(() => {
        expect(showStatusNotification).toHaveBeenCalledWith(
          'processing_to_rejected',
          'SF-C12-M-002'
        );
      });
    });

    it('should trigger toast notification when status changes from processing to error_processing', async () => {
      // Given: Hook setup
      
      let eventHandler: ((payload: BlockRealtimePayload) => void) | null = null;
      mockChannel.on.mockImplementation((event, config, handler) => {
        eventHandler = handler;
        return mockChannel;
      });

      // When: Hook is rendered
      renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // And: Error event is received
      const payload: BlockRealtimePayload = {
        eventType: 'UPDATE',
        new: {
          id: mockBlockId,
          iso_code: 'SF-C12-M-003',
          status: 'error_processing' as BlockStatus,
          validation_report: null,
          created_at: '2026-02-15T12:00:00Z',
          updated_at: '2026-02-15T12:05:00Z',
        },
        old: {
          id: mockBlockId,
          status: 'processing' as BlockStatus,
        },
      };

      eventHandler?.(payload);

      // Then: Should show warning notification
      await waitFor(() => {
        expect(showStatusNotification).toHaveBeenCalledWith(
          'processing_to_error',
          'SF-C12-M-003'
        );
      });
    });

    it('should call onStatusChange callback when status changes', async () => {
      // Given: Hook with callback
      const onStatusChange = vi.fn();
      
      let eventHandler: ((payload: BlockRealtimePayload) => void) | null = null;
      mockChannel.on.mockImplementation((event, config, handler) => {
        eventHandler = handler;
        return mockChannel;
      });

      // When: Hook is rendered with callback
      renderHook(() =>
        useBlockStatusListener({ 
          blockId: mockBlockId,
          onStatusChange,
        })
      );

      // And: Status change event is received
      const payload: BlockRealtimePayload = {
        eventType: 'UPDATE',
        new: {
          id: mockBlockId,
          iso_code: 'SF-C12-M-004',
          status: 'validated' as BlockStatus,
          validation_report: null,
          created_at: '2026-02-15T12:00:00Z',
          updated_at: '2026-02-15T12:05:00Z',
        },
        old: {
          id: mockBlockId,
          status: 'processing' as BlockStatus,
        },
      };

      eventHandler?.(payload);

      // Then: Should invoke callback with old and new status
      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('processing', 'validated');
      });
    });

    it('should NOT trigger notification if status did not actually change', async () => {
      // Given: Hook setup
      
      let eventHandler: ((payload: BlockRealtimePayload) => void) | null = null;
      mockChannel.on.mockImplementation((event, config, handler) => {
      });

      // When: Hook is rendered
      renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // And: Event with same status is received (e.g., validation_report update only)
      const payload: BlockRealtimePayload = {
        eventType: 'UPDATE',
        new: {
          id: mockBlockId,
          iso_code: 'SF-C12-M-005',
          status: 'validated' as BlockStatus,
          validation_report: { is_valid: true, errors: [] } as any,
          created_at: '2026-02-15T12:00:00Z',
          updated_at: '2026-02-15T12:05:00Z',
        },
        old: {
          id: mockBlockId,
          status: 'validated' as BlockStatus,  // Same status
        },
      };

      eventHandler?.(payload);

      // Then: Should NOT show notification
      expect(showStatusNotification).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup and Unsubscribe', () => {
    it('should unsubscribe from channel on unmount', async () => {
      // Given: Hook is rendered
      const { unmount } = renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // When: Component unmounts
      unmount();

      // Then: Should unsubscribe from channel
      await waitFor(() => {
        expect(mockChannel.unsubscribe).toHaveBeenCalled();
      });
    });

    it('should provide manual unsubscribe function', async () => {
      // Given: Hook is rendered
      const { result } = renderHook(() =>
        useBlockStatusListener({ blockId: mockBlockId })
      );

      // When: Manually calling unsubscribe
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      result.current.unsubscribe();

      // Then: Should unsubscribe from channel
      await waitFor(() => {
        expect(mockChannel.unsubscribe).toHaveBeenCalled();
      });

      // And: Should update connection state
      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });
  });

  describe('Disabled State', () => {
    it('should not subscribe if enabled is false', async () => {
      // Given: Hook with enabled=false
      
      // When: Hook is rendered with enabled=false
      const { result } = renderHook(() =>
        useBlockStatusListener({ 
          enabled: false,
        })
      );

      // Then: Should not create channel
      expect(mockSupabaseClient.channel).not.toHaveBeenCalled();

      // And: Should not be loading
      expect(result.current.isLoading).toBe(false);

      // And: Should not be connected
      expect(result.current.isConnected).toBe(false);
    });
  });
});
