/**
 * useBlockStatusListener Hook (T-031-FRONT)
 * 
 * Custom React hook for subscribing to block status changes via Supabase Realtime.
 * Automatically displays toast notifications and provides connection state.
 */

import { useEffect, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  UseBlockStatusListenerOptions,
  UseBlockStatusListenerReturn,
  BlockRealtimePayload,
  StatusTransition,
} from '../types/realtime';
import type { BlockStatus } from '../types/validation';
import { getSupabaseClient } from '../services/supabase.client';
import { showStatusNotification } from '../services/notification.service';

/**
 * Constants for Realtime channel configuration
 */
const REALTIME_SCHEMA = 'public';
const REALTIME_TABLE = 'blocks';
const REALTIME_EVENT = 'UPDATE';

/**
 * Generate channel name for a specific block.
 * 
 * @param blockId - The block ID to subscribe to
 * @returns Formatted channel name
 * @internal
 */
function getChannelName(blockId: string): string {
  return `block-${blockId}`;
}

/**
 * Hook for listening to block status changes in real-time.
 * 
 * @param options - Configuration options
 * @returns Connection state and unsubscribe function
 */
export function useBlockStatusListener(
  options: UseBlockStatusListenerOptions
): UseBlockStatusListenerReturn {
  const { blockId, onStatusChange, enabled = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Manual unsubscribe function
  const unsubscribe = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
      setIsConnected(false);
    }
  }, [channel]);

  useEffect(() => {
    // Don't subscribe if disabled
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Create channel for this block
    const channelName = getChannelName(blockId);
    const realtimeChannel = supabase.channel(channelName);

    // Configure postgres_changes listener
    realtimeChannel.on(
      'postgres_changes',
      {
        event: REALTIME_EVENT,
        schema: REALTIME_SCHEMA,
        table: REALTIME_TABLE,
        filter: `id=eq.${blockId}`,
      },
      (payload: BlockRealtimePayload) => {
        const oldStatus = payload.old?.status;
        const newStatus = payload.new.status;

        // Only process if status actually changed
        if (oldStatus && oldStatus !== newStatus) {
          // Determine transition type
          const transition = determineTransition(oldStatus, newStatus);

          // Show notification if it's a recognized transition
          if (transition) {
            showStatusNotification(transition, payload.new.iso_code);
          }

          // Call optional callback
          if (onStatusChange) {
            onStatusChange(oldStatus, newStatus);
          }
        }
      }
    );

    // Subscribe to channel
    realtimeChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
      } else if (status === 'CHANNEL_ERROR') {
        setError(new Error('Failed to subscribe to Realtime channel'));
        setIsConnected(false);
        setIsLoading(false);
      } else if (status === 'TIMED_OUT') {
        setError(new Error('Subscription timeout - could not connect to Realtime'));
        setIsConnected(false);
        setIsLoading(false);
      }
    });

    // Store channel reference for unsubscribe
    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [blockId, onStatusChange, enabled]);

  return {
    isConnected,
    isLoading,
    error,
    unsubscribe,
  };
}

/**
 * Determine the status transition type for notification.
 * 
 * @param oldStatus - Previous status
 * @param newStatus - New status
 * @returns StatusTransition or null if not a recognized transition
 */
function determineTransition(
  oldStatus: BlockStatus,
  newStatus: BlockStatus
): StatusTransition | null {
  if (oldStatus === 'processing' && newStatus === 'validated') {
    return 'processing_to_validated';
  }
  if (oldStatus === 'processing' && newStatus === 'rejected') {
    return 'processing_to_rejected';
  }
  if (oldStatus === 'processing' && newStatus === 'error_processing') {
    return 'processing_to_error';
  }
  return null;
}
