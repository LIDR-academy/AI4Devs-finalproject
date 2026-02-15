/**
 * Realtime types for Supabase subscriptions (T-031-FRONT)
 * 
 * These types define the structure of Supabase Realtime events
 * for listening to database changes on the blocks table.
 */

import { BlockStatus } from './validation';

/**
 * Payload structure for Supabase Realtime events on 'blocks' table.
 * 
 * Supabase Realtime emits events with this structure for database changes:
 * - INSERT: new row created
 * - UPDATE: existing row modified
 * - DELETE: row removed
 * 
 * @see https://supabase.com/docs/guides/realtime/postgres-changes
 */
export interface BlockRealtimePayload {
  /** Type of database event */
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  
  /** New row state (after the change) */
  new: {
    id: string;  // UUID
    iso_code: string;
    status: BlockStatus;
    validation_report: unknown | null;  // JSONB
    created_at: string;  // ISO datetime
    updated_at: string;  // ISO datetime
  };
  
  /** Old row state (before the change, partial for UPDATE events) */
  old: {
    id: string;
    status?: BlockStatus;  // Only available for UPDATE events
  };
}

/**
 * Status transition types that trigger user notifications.
 * 
 * These represent meaningful state changes in the block lifecycle
 * that the user should be notified about via toast messages.
 */
export type StatusTransition = 
  | 'processing_to_validated'   // ✅ Validation succeeded
  | 'processing_to_rejected'    // ❌ Validation failed
  | 'processing_to_error';      // ⚠️ Processing error

/**
 * Notification configuration for each status transition.
 * 
 * Defines how to display toast messages for different state changes.
 */
export interface StatusNotification {
  /** Visual type of notification (affects styling) */
  type: 'success' | 'error' | 'warning';
  
  /** Notification title */
  title: string;
  
  /** Notification message (may contain {iso_code} placeholder) */
  message: string;
  
  /** Icon/emoji to display */
  icon: string;
}

/**
 * Options for useBlockStatusListener hook.
 */
export interface UseBlockStatusListenerOptions {
  /** Block ID (UUID) to listen to */
  blockId: string;
  
  /** Callback fired when status changes */
  onStatusChange?: (oldStatus: BlockStatus, newStatus: BlockStatus) => void;
  
  /** Enable/disable the realtime listener (default: true) */
  enabled?: boolean;
}

/**
 * Return type for useBlockStatusListener hook.
 */
export interface UseBlockStatusListenerReturn {
  /** Whether successfully connected to Realtime channel */
  isConnected: boolean;
  
  /** Loading state during initial subscription */
  isLoading: boolean;
  
  /** Error state if subscription fails */
  error: Error | null;
  
  /** Manually unsubscribe (also auto-cleans on unmount) */
  unsubscribe: () => void;
}
