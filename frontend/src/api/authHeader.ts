/**
 * Auth Header Utility
 *
 * Returns the Authorization Bearer header for authenticated API calls.
 * Reads the token from the Zustand authStore's current state (non-reactive snapshot).
 *
 * Usage:
 *   fetch(url, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } })
 *   new Configuration({ basePath, headers: getAuthHeaders() })
 */

import { useAuthStore } from '@/state/authStore';

/**
 * Returns { Authorization: 'Bearer <token>' } when a session exists,
 * or an empty object when there is no active session.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().session?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
