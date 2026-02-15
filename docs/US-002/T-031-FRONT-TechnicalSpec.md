# T-031-FRONT: Real-Time Status Listener - Technical Specification

**Author:** AI Assistant (Prompt #TBD - Enrichment Phase)  
**Date:** 2026-02-15  
**Status:** ✅ READY FOR TDD-RED  
**Ticket Type:** FRONT (Frontend React/TypeScript)  
**Priority:** 🟡 ALTA

---

## 1. Ticket Summary

- **Ticket ID:** T-031-FRONT
- **Title:** Real-Time Status Listener
- **Type:** FRONT (Frontend Development - React Hooks + Supabase Realtime)
- **User Story:** US-002 (Validación Automática por "The Librarian")
- **Scope:** Implementar hook custom `useBlockStatusListener(blockId)` que se suscribe a cambios en tiempo real de la tabla `blocks` usando Supabase Realtime. Al detectar transiciones de estado (`processing` → `validated`/`rejected`), dispara notificaciones toast y refetch automático de datos.
- **Dependencies:** 
  - **T-030-BACK** ✅ DONE - Endpoint `GET /api/parts/{id}/validation` (ya retorna status actual)
  - **T-021-DB** ✅ DONE - ENUM `block_status` extendido
  - **T-029-BACK** ✅ DONE - Agent worker actualiza `blocks.status` durante validación

---

## 2. Business Requirements

### 2.1 Functional Requirements

1. **FR-1:** El hook debe conectarse a Supabase Realtime para escuchar cambios en la tabla `blocks`
2. **FR-2:** Debe filtrar eventos por `block_id` específico (row-level subscription)
3. **FR-3:** Cuando `status` cambia de `processing` → `validated`, mostrar toast de éxito ✅
4. **FR-4:** Cuando `status` cambia de `processing` → `rejected`, mostrar toast de error ❌
5. **FR-5:** Cuando `status` cambia de `processing` → `error_processing`, mostrar toast de warning ⚠️
6. **FR-6:** Al detectar cambio de estado, disparar callback `onStatusChange` para refetch de datos
7. **FR-7:** Limpiar suscripción Realtime cuando el componente se desmonta (cleanup en useEffect)

### 2.2 Non-Functional Requirements

- **NFR-1:** Conexión Realtime resiliente (reconexión automática si se pierde conexión)
- **NFR-2:** Toasts deben desaparecer automáticamente tras 5 segundos
- **NFR-3:** Toasts deben ser accesibles (role="alert" para screen readers)
- **NFR-4:** Evitar memory leaks (unsubscribe en cleanup)
- **NFR-5:** No polling (100% event-driven con Realtime)
- **NFR-6:** Logging estructurado en development mode (debug de eventos Realtime)

---

## 3. Data Structures & Contracts

### 3.1 Frontend Types (TypeScript)

#### 3.1.1 Supabase Realtime Types (NEW - to create)

```typescript
// File: src/frontend/src/types/realtime.ts

import { BlockStatus } from './validation';

/**
 * Payload structure for Supabase Realtime events on 'blocks' table.
 * 
 * Supabase Realtime emits events with structure:
 * {
 *   eventType: 'INSERT' | 'UPDATE' | 'DELETE',
 *   new: { ...row data },  // New row state (after change)
 *   old: { ...row data },  // Old row state (before change, partial for UPDATE)
 * }
 */
export interface BlockRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: {
    id: string;  // UUID
    iso_code: string;
    status: BlockStatus;
    validation_report: unknown | null;  // JSONB
    created_at: string;
    updated_at: string;
  };
  old: {
    id: string;
    status?: BlockStatus;  // Only status changes are relevant
  };
}

/**
 * Status transition types that trigger notifications.
 */
export type StatusTransition = 
  | 'processing_to_validated'
  | 'processing_to_rejected'
  | 'processing_to_error';

/**
 * Notification configuration for each transition type.
 */
export interface StatusNotification {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  icon: string;
}
```

#### 3.1.2 Hook Return Type (NEW)

```typescript
// File: src/frontend/src/hooks/useBlockStatusListener.ts (type definitions)

export interface UseBlockStatusListenerOptions {
  /** Block ID to listen to */
  blockId: string;
  
  /** Callback fired when status changes */
  onStatusChange?: (oldStatus: BlockStatus, newStatus: BlockStatus) => void;
  
  /** Enable/disable realtime listener (default: true) */
  enabled?: boolean;
}

export interface UseBlockStatusListenerReturn {
  /** Current connection status */
  isConnected: boolean;
  
  /** Loading state during initial subscription */
  isLoading: boolean;
  
  /** Error state if subscription fails */
  error: Error | null;
  
  /** Manually unsubscribe (auto cleanup on unmount) */
  unsubscribe: () => void;
}
```

### 3.2 Backend Schema (Already Exists - T-021-DB)

```sql
-- NO CHANGES REQUIRED
-- This ticket only consumes existing schema via Realtime API

-- Table: blocks
-- Column: status (ENUM block_status)
-- Values: uploaded, processing, validated, rejected, error_processing, in_fabrication, completed, archived

-- Supabase Realtime listens to UPDATE events on this column automatically
-- No migration needed, just enable Realtime on 'blocks' table in Supabase dashboard
```

---

## 4. Component/Service Architecture

### 4.1 Supabase Client Singleton (NEW - to create)

```typescript
// File: src/frontend/src/services/supabase.client.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Environment variables (must be set in .env)
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

/**
 * Singleton Supabase client instance.
 * Initialized once and reused across the app.
 * 
 * Security Note: Using anon key (public). Row-level security (RLS) in Supabase
 * protects data access. For authenticated features, use `supabase.auth.signIn()`.
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance.
 * 
 * @returns Configured Supabase client
 * 
 * @example
 * ```typescript
 * const supabase = getSupabaseClient();
 * const channel = supabase.channel('blocks-changes');
 * ```
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,  // Rate limiting for realtime events
        },
      },
    });
  }
  return supabaseClient;
}
```

**Architecture Pattern:** Singleton factory function (same pattern as backend's `get_supabase_client()` in `infra/supabase_client.py`).

### 4.2 Custom Hook: useBlockStatusListener (NEW - core component)

```typescript
// File: src/frontend/src/hooks/useBlockStatusListener.ts

import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from '../services/supabase.client';
import { showStatusNotification } from '../services/notification.service';
import { 
  UseBlockStatusListenerOptions, 
  UseBlockStatusListenerReturn,
  BlockRealtimePayload,
} from '../types/realtime';
import { BlockStatus } from '../types/validation';

/**
 * Hook to listen to real-time status changes for a specific block.
 * 
 * Subscribes to Supabase Realtime updates on the 'blocks' table,
 * filtered by block ID. Triggers toast notifications and callbacks
 * when status transitions occur (e.g., processing → validated).
 * 
 * @param options - Configuration options
 * @returns Connection state and control functions
 * 
 * @example
 * ```typescript
 * const { isConnected, error } = useBlockStatusListener({
 *   blockId: '550e8400-e29b-41d4-a716-446655440000',
 *   onStatusChange: (oldStatus, newStatus) => {
 *     console.log(`Status changed: ${oldStatus} → ${newStatus}`);
 *     refetchBlockData();  // Trigger data refresh
 *   },
 * });
 * ```
 */
export function useBlockStatusListener(
  options: UseBlockStatusListenerOptions
): UseBlockStatusListenerReturn {
  const { blockId, onStatusChange, enabled = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Handle status change logic
  const handleStatusUpdate = useCallback(
    (payload: BlockRealtimePayload) => {
      const oldStatus = payload.old.status;
      const newStatus = payload.new.status;

      // Ignore if status didn't actually change
      if (oldStatus === newStatus) return;

      // Detect transitions from 'processing' state
      if (oldStatus === 'processing') {
        if (newStatus === 'validated') {
          showStatusNotification('processing_to_validated', payload.new.iso_code);
        } else if (newStatus === 'rejected') {
          showStatusNotification('processing_to_rejected', payload.new.iso_code);
        } else if (newStatus === 'error_processing') {
          showStatusNotification('processing_to_error', payload.new.iso_code);
        }
      }

      // Call user callback
      if (onStatusChange && oldStatus && newStatus) {
        onStatusChange(oldStatus, newStatus);
      }
    },
    [onStatusChange]
  );

  // Setup realtime subscription
  useEffect(() => {
    if (!enabled || !blockId) {
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    
    // Create unique channel for this block
    const channelName = `block-${blockId}`;
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'blocks',
          filter: `id=eq.${blockId}`,  // Row-level filter
        },
        (payload) => handleStatusUpdate(payload as BlockRealtimePayload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setIsLoading(false);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setIsLoading(false);
          setError(new Error('Failed to subscribe to realtime channel'));
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setIsLoading(false);
          setError(new Error('Subscription timeout'));
        }
      });

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      realtimeChannel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
    };
  }, [blockId, enabled, handleStatusUpdate]);

  // Manual unsubscribe function
  const unsubscribe = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
    }
  }, [channel]);

  return {
    isConnected,
    isLoading,
    error,
    unsubscribe,
  };
}
```

### 4.3 Notification Service (NEW - toast system)

```typescript
// File: src/frontend/src/services/notification.service.ts

import { StatusTransition, StatusNotification } from '../types/realtime';

/**
 * Notification messages for each status transition.
 * Following constants extraction pattern (T-001-FRONT).
 */
const NOTIFICATION_CONFIG: Record<StatusTransition, StatusNotification> = {
  processing_to_validated: {
    type: 'success',
    title: '✅ Validation Complete',
    message: 'Block {iso_code} passed all quality checks',
    icon: '✅',
  },
  processing_to_rejected: {
    type: 'error',
    title: '❌ Validation Failed',
    message: 'Block {iso_code} has validation errors',
    icon: '❌',
  },
  processing_to_error: {
    type: 'warning',
    title: '⚠️ Processing Error',
    message: 'Block {iso_code} encountered an error during validation',
    icon: '⚠️',
  },
} as const;

/**
 * Show a toast notification for a status transition.
 * 
 * Implementation options:
 * 1. Native browser Notification API (requires permission)
 * 2. Custom toast component (lightweight, recommended for MVP)
 * 3. react-hot-toast library (future enhancement)
 * 
 * For MVP: Use simple DOM manipulation to inject toast.
 * For production: Replace with proper toast library.
 * 
 * @param transition - Type of status transition
 * @param isoCode - Block ISO code to display in message
 */
export function showStatusNotification(
  transition: StatusTransition,
  isoCode: string
): void {
  const config = NOTIFICATION_CONFIG[transition];
  const message = config.message.replace('{iso_code}', isoCode);

  // MVP Implementation: Simple browser alert
  // TODO (Post-MVP): Replace with react-hot-toast or custom Toast component
  console.log(`[${config.type.toUpperCase()}] ${config.title}: ${message}`);
  
  // For now, use native browser notification (fallback to console.log)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(config.title, {
      body: message,
      icon: config.icon,
      tag: `block-${isoCode}`,  // Prevent duplicate notifications
    });
  } else {
    // Fallback: Custom DOM toast (temporary MVP solution)
    showDOMToast(config.type, config.title, message);
  }
}

/**
 * MVP Toast implementation using DOM manipulation.
 * Injects a temporary toast element at bottom-right of viewport.
 * 
 * @param type - Notification type (success, error, warning)
 * @param title - Toast title
 * @param message - Toast message
 */
function showDOMToast(
  type: 'success' | 'error' | 'warning',
  title: string,
  message: string
): void {
  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  // Styling based on type
  const colorMap = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
  };

  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    min-width: 300px;
    max-width: 400px;
    padding: 16px;
    background: white;
    border-left: 4px solid ${colorMap[type]};
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;

  toast.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px; color: #333;">${title}</div>
    <div style="font-size: 14px; color: #666;">${message}</div>
  `;

  // Inject CSS animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 5000);
}

/**
 * Request browser notification permission (call on user interaction).
 * Required for native Notification API.
 */
export async function requestNotificationPermission(): Promise<void> {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}
```

**Architecture Notes:**
- **MVP approach:** Simple DOM-based toasts (no external dependencies)
- **Future enhancement:** Replace with `react-hot-toast` or custom React component
- **Accessibility:** Follows WAI-ARIA patterns (`role="alert"`, `aria-live="polite"`)

---

## 5. Test Cases Checklist

### 5.1 Happy Path (Core Functionality)

- [ ] **Test 1:** Hook subscribes successfully to Supabase Realtime channel
  - Given: Valid `blockId` provided to hook
  - When: Component mounts
  - Then: `isConnected === true`, `isLoading === false`, `error === null`

- [ ] **Test 2:** Status change from `processing` → `validated` triggers success toast
  - Given: Block in `processing` state
  - When: Realtime event UPDATE with `new.status = 'validated'`, `old.status = 'processing'`
  - Then: Toast appears with title "✅ Validation Complete"
  - And: `onStatusChange` callback invoked with `('processing', 'validated')`

- [ ] **Test 3:** Status change from `processing` → `rejected` triggers error toast
  - Given: Block in `processing` state
  - When: Realtime event UPDATE with `new.status = 'rejected'`
  - Then: Toast appears with title "❌ Validation Failed"

- [ ] **Test 4:** Channel cleanup on unmount prevents memory leaks
  - Given: Hook is active and subscribed
  - When: Component unmounts
  - Then: Channel unsubscribed, `isConnected === false`

### 5.2 Edge Cases (Error Handling & Boundaries)

- [ ] **Test 5:** Hook handles missing environment variables gracefully
  - Given: `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` not set
  - When: `getSupabaseClient()` is called
  - Then: Throws descriptive error (caught in development, logged in production)

- [ ] **Test 6:** Hook ignores status changes for wrong block ID
  - Given: Subscribed to block A
  - When: Realtime event for block B received
  - Then: No toast shown, `onStatusChange` not called

- [ ] **Test 7:** Hook handles Realtime connection timeout
  - Given: Network latency >30s (Supabase default timeout)
  - When: Subscribe attempt times out
  - Then: `error` state contains timeout error, `isConnected === false`

- [ ] **Test 8:** Disabled hook does not create subscription
  - Given: `enabled: false` option
  - When: Component mounts
  - Then: No channel created, `isConnected === false`, `isLoading === false`

### 5.3 Security & Data Integrity

- [ ] **Test 9:** Anon key does not allow writes to `blocks` table
  - Given: Supabase client with anon key
  - When: Attempt to UPDATE `blocks.status` via client
  - Then: Operation rejected by RLS policy (403 Forbidden)

- [ ] **Test 10:** Only status changes are processed (ignore metadata updates)
  - Given: UPDATE event with same `status` but different `validation_report`
  - When: Realtime event received
  - Then: No toast shown (only status transitions trigger notifications)

### 5.4 Integration Tests (Real Supabase Connection)

- [ ] **Test 11:** End-to-end flow with real Supabase instance
  - Given: Test environment with Supabase project
  - When: Worker updates `blocks.status` to `validated`
  - Then: Frontend hook receives event within <2 seconds
  - And: Toast appears in UI

- [ ] **Test 12:** Multiple concurrent clients receive same events
  - Given: Two browser tabs with same `blockId` hook
  - When: Worker updates status
  - Then: Both tabs show toast notification (no event loss)

---

## 6. Files to Create/Modify

### 6.1 New Files (CREATE)

1. **`src/frontend/src/services/supabase.client.ts`**
   - Singleton Supabase client factory
   - Environment variable validation
   - Realtime configuration

2. **`src/frontend/src/types/realtime.ts`**
   - TypeScript interfaces for Realtime payloads
   - Status transition types
   - Notification configuration types

3. **`src/frontend/src/hooks/useBlockStatusListener.ts`**
   - Custom React hook for Realtime subscription
   - Status change detection logic
   - Connection state management

4. **`src/frontend/src/services/notification.service.ts`**
   - Toast notification system (MVP DOM-based)
   - Status notification messages (constants)
   - Permission handling for browser notifications

5. **`src/frontend/src/hooks/useBlockStatusListener.test.tsx`**
   - Unit tests for hook behavior
   - Mock Supabase Realtime channel
   - Edge case validation

6. **`src/frontend/src/services/notification.service.test.ts`**
   - Unit tests for notification logic
   - Toast message validation
   - DOM manipulation testing

### 6.2 Files to Modify (UPDATE)

1. **`src/frontend/package.json`**
   - Add dependency: `"@supabase/supabase-js": "^2.39.0"`
   - (Latest version as of Feb 2026)

2. **`src/frontend/.env.example`** (if exists, otherwise create)
   - Add template variables:
     ```env
     VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```

3. **`src/frontend/src/types/validation.ts`** (if BlockStatus not already exported)
   - Ensure `BlockStatus` type is exported for reuse in realtime.ts
   - (Already done in T-030-BACK, just verify)

4. **`.gitignore`** (project root)
   - Ensure `.env` is ignored (protect Supabase keys)
   - Add line: `src/frontend/.env` if not present

5. **`docs/US-002/README.md`** (update ticket status)
   - Mark `T-031-FRONT` as "In Progress → TDD-Red"

### 6.3 Infrastructure Changes (INFRA)

1. **Supabase Dashboard Configuration** (MANUAL STEP - NOT CODE)
   - Navigate to: Supabase Project → Database → Replication
   - Enable Realtime for `blocks` table
   - Enable Row Level Security (RLS) if not already enabled
   - Verify RLS policies allow `SELECT` with anon key (read-only)

2. **Environment Variables in Deployment** (CI/CD)
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Railway/Vercel secrets
   - Document in `.github/SECRETS-SETUP.md` (sanitized example)

---

## 7. Reusable Components/Patterns

### 7.1 Patterns from Existing Codebase

✅ **Singleton Factory Pattern** (from `infra/supabase_client.py`)
- Reused for `getSupabaseClient()` in frontend
- Same pattern ensures consistency across stack

✅ **Constants Extraction Pattern** (from `T-001-FRONT`)
- Applied to `NOTIFICATION_CONFIG` constants
- Messages, colors, and configuration separated from logic

✅ **Service Layer Pattern** (from `upload.service.ts`)
- `notification.service.ts` follows same architecture
- Isolates toast logic from hook implementation

✅ **Custom Hook Pattern** (React best practices)
- `useBlockStatusListener` encapsulates Realtime subscription
- Returns connection state (similar to `useQuery` API)

### 7.2 Reusable for Future Tickets

🔄 **Toast Notification System** (`notification.service.ts`)
- Can be reused for:
  - T-032-FRONT (Validation Report Visualizer) → Show detailed error toasts
  - T-050-FRONT (Status Selector) → Confirm state transitions
  - US-009 (Evidence Upload) → Upload success/failure notifications

🔄 **Supabase Client Singleton** (`supabase.client.ts`)
- Can be reused for:
  - US-013 (Auth) → Authentication flows (`supabase.auth.signIn()`)
  - US-005 (Dashboard) → Realtime updates for parts list
  - Future features requiring Supabase API (Storage, Database queries)

🔄 **Realtime Hook Pattern** (`useBlockStatusListener`)
- Template for future Realtime hooks:
  - `useBlockListListener()` (listen to INSERT events for new blocks)
  - `useValidationReportListener()` (listen to validation_report JSONB updates)

---

## 8. Next Steps - TDD-RED Phase Handoff

This specification is ready for TDD-Red implementation. Use the snippet `:tdd-red` with the following context:

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-031-FRONT
Feature name:    Real-Time Block Status Listener
Key test cases:  
  1. Hook subscribes successfully (isConnected === true)
  2. processing → validated triggers success toast
  3. processing → rejected triggers error toast
  4. Channel cleanup on unmount (no memory leaks)
  5. Disabled hook does not subscribe
Files to create:
  - src/frontend/src/services/supabase.client.ts
  - src/frontend/src/types/realtime.ts
  - src/frontend/src/hooks/useBlockStatusListener.ts
  - src/frontend/src/services/notification.service.ts
  - src/frontend/src/hooks/useBlockStatusListener.test.tsx
  - src/frontend/src/services/notification.service.test.ts
Files to modify:
  - src/frontend/package.json (add @supabase/supabase-js)
  - src/frontend/.env.example (add Supabase vars)
Dependencies to install:
  - @supabase/supabase-js@^2.39.0
External configuration:
  - Enable Realtime on 'blocks' table in Supabase Dashboard
  - Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
=============================================
```

---

## 9. Risk Assessment & Mitigation

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Supabase Realtime quota exceeded (free tier: 2M events/month) | Medium | High | Monitor usage, implement client-side throttling (eventsPerSecond: 10) |
| Toast notifications spam user (rapid status changes) | Low | Medium | Debounce notifications (max 1 per block per 10s) |
| Memory leak from uncleaned channels | Medium | High | Strict useEffect cleanup, add E2E leak tests |
| Environment variables missing in production | High | Critical | Add validation in Dockerfile, fail fast if missing |
| RLS policies too restrictive (blocks Realtime) | Low | High | Test with anon key before deployment, verify RLS allows SELECT |

### 9.2 UX Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| User misses toast (too fast auto-dismiss) | Medium | Low | Make dismissable manually, increase timeout to 7s (vs 5s) |
| Toast blocks important UI elements | Low | Medium | Position at bottom-right, add z-index management |
| No visual feedback for "processing" state | High | Medium | Add spinner/loading indicator (separate ticket: T-032-FRONT) |

### 9.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Anon key exposed in client bundle | High (but expected) | Low | Document as expected (public key), sensitive data protected by RLS |
| Malicious UPDATE events (if RLS misconfigured) | Low | Critical | Test RLS policies, ensure anon key is read-only |
| XSS in toast messages (if user input in iso_code) | Low | Medium | Sanitize iso_code before display (though backend controls values) |

---

## 10. Performance Budget

| Metric | Target | Max Acceptable | Measurement Method |
|--------|--------|----------------|-------------------|
| Channel subscription time | <500ms | <2s | Time from `subscribe()` to `status === 'SUBSCRIBED'` |
| Event propagation latency | <1s | <3s | Time from DB UPDATE to frontend event handler |
| Toast render time | <100ms | <300ms | Time from `showStatusNotification()` to DOM injection |
| Memory per active subscription | <50KB | <200KB | Chrome DevTools Memory Profiler |
| Network bandwidth (Realtime) | <1KB/event | <5KB/event | Chrome DevTools Network tab |

---

## 11. Documentation Requirements

### 11.1 Code Documentation

- [ ] JSDoc comments for all exported functions (Google style)
- [ ] TypeScript interfaces documented with usage examples
- [ ] Hook usage documented with code snippets (see template in spec)

### 11.2 User Documentation

- [ ] Update `memory-bank/systemPatterns.md`:
  - Add section "Realtime Architecture Pattern"
  - Document Supabase client singleton pattern
  - Add custom hook pattern example

- [ ] Update `memory-bank/techContext.md`:
  - Add `@supabase/supabase-js` to "Frontend Stack" dependencies
  - Document environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

- [ ] Update `docs/09-mvp-backlog.md`:
  - Mark T-031-FRONT as "In Progress"
  - Add completion timestamp when DoD achieved

---

## 12. Definition of Done (DoD)

This ticket is complete when ALL of the following are true:

### 12.1 Code Quality
- [ ] All 12 test cases pass (unit + integration)
- [ ] TypeScript strict mode: 0 errors, 0 warnings
- [ ] ESLint: 0 errors, 0 warnings
- [ ] Code coverage >80% for hook and notification service

### 12.2 Functionality
- [ ] Hook successfully subscribes to Realtime on mount
- [ ] Toast appears when status changes from `processing` → `validated`
- [ ] Toast appears when status changes from `processing` → `rejected`
- [ ] Toast appears when status changes from `processing` → `error_processing`
- [ ] `onStatusChange` callback invoked correctly
- [ ] Channel cleanup on unmount (verified via console logs, no errors)

### 12.3 User Experience
- [ ] Toast is visible for 5 seconds minimum
- [ ] Toast can be manually dismissed (click to close)
- [ ] Toast does not block important UI elements
- [ ] Toast is accessible (screen reader announces message)

### 12.4 Integration
- [ ] Environment variables set in `.env` (local)
- [ ] Supabase Realtime enabled on `blocks` table (verified in dashboard)
- [ ] Manual E2E test: Update block status in Supabase SQL editor → Toast appears in browser

### 12.5 Documentation
- [ ] `systemPatterns.md` updated with Realtime pattern
- [ ] `techContext.md` updated with new dependencies
- [ ] `prompts.md` entry for this enrichment phase
- [ ] `activeContext.md` reflects current status

### 12.6 Security & Performance
- [ ] RLS policies verified (anon key cannot write to blocks)
- [ ] No memory leaks (Chrome DevTools Heap Snapshot: stable memory)
- [ ] Event latency <3s (measured in dev environment)

---

**Status:** 📋 SPEC COMPLETE - Ready for TDD-Red Phase  
**Next Action:** Run `:tdd-red` prompt with handoff data from Section 8
