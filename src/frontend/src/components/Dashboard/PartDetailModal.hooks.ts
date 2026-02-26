/**
 * Custom Hooks for PartDetailModal
 * T-1007-FRONT: Modal Integration - Data Fetching Logic
 * 
 * @remarks
 * Extracts data fetching and keyboard logic from main component for better testability
 * and separation of concerns. Follows Clean Architecture pattern.
 * 
 * @module PartDetailModal.hooks
 */

import { useEffect, useState } from 'react';
import type { AdjacentPartsInfo } from '@/types/modal';
import type { PartDetail } from '@/types/parts';
import { getPartDetail } from '@/services/upload.service';
import { getPartNavigation } from '@/services/navigation.service';
import { ERROR_MESSAGES, KEYBOARD_SHORTCUTS } from './PartDetailModal.constants';

/**
 * Fetches part detail data when partId changes
 * 
 * @param partId - UUID of the part to fetch
 * @param isOpen - Whether modal is open (prevents unnecessary fetches)
 * @returns Object with partData, loading state, error state, and retry function
 * 
 * @example
 * const { partData, loading, error, retry } = usePartDetail(partId, isOpen);
 */
export function usePartDetail(partId: string, isOpen: boolean) {
  const [partData, setPartData] = useState<PartDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !partId) return;

    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      // Set timeout to abort request after 10s (ERR-INT-02)
      timeoutId = setTimeout(() => {
        abortController.abort();
        setError(new Error(ERROR_MESSAGES.TIMEOUT));
        setLoading(false);
      }, 10000);

      try {
        const data = await getPartDetail(partId);
        clearTimeout(timeoutId);
        setPartData(data);
      } catch (err) {
        clearTimeout(timeoutId);
        // Don't set error if already set by timeout
        if (!abortController.signal.aborted || err instanceof Error && err.message !== 'AbortError') {
          setError(err instanceof Error ? err : new Error(ERROR_MESSAGES.GENERIC_ERROR));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup: abort request and clear timeout on unmount
    return () => {
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [isOpen, partId, retryTrigger]);

  // Retry function to re-trigger fetch
  const retry = () => {
    setRetryTrigger(prev => prev + 1);
  };

  return { partData, loading, error, retry };
}

/**
 * Fetches navigation data (prev/next part IDs) for modal navigation
 * 
 * @param partId - UUID of current part
 * @param isOpen - Whether modal is open
 * @param enableNavigation - Whether navigation is enabled
 * @param filters - Current filter state to pass to navigation API
 * @returns Object with adjacentParts data and loading state
 * 
 * @example
 * const { adjacentParts, navigationLoading } = usePartNavigation(
 *   partId, 
 *   isOpen, 
 *   enableNavigation, 
 *   filters
 * );
 */
export function usePartNavigation(
  partId: string,
  isOpen: boolean,
  enableNavigation: boolean,
  filters: { status?: string[]; tipologia?: string[]; workshop_id?: string } | null
) {
  const [adjacentParts, setAdjacentParts] = useState<AdjacentPartsInfo | null>(null);
  const [navigationLoading, setNavigationLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !partId || !enableNavigation) return;

    const fetchNavigation = async () => {
      setNavigationLoading(true);
      try {
        const navData = await getPartNavigation(partId, filters);
        setAdjacentParts(navData);
      } catch (err) {
        // Silent fail for navigation (non-critical feature)
        setAdjacentParts(null);
      } finally {
        setNavigationLoading(false);
      }
    };

    fetchNavigation();
  }, [isOpen, partId, enableNavigation, filters]);

  return { adjacentParts, navigationLoading };
}

/**
 * Handles keyboard shortcuts for modal (ESC close, ← → navigation)
 * 
 * @param isOpen - Whether modal is open
 * @param onClose - Close modal callback
 * @param onNavigate - Navigate to target part callback
 * @param adjacentParts - Navigation data (prev/next IDs)
 * @param enableNavigation - Whether navigation is enabled
 * 
 * @example
 * useModalKeyboard(
 *   isOpen,
 *   handleClose,
 *   handleNavigate,
 *   adjacentParts,
 *   enableNavigation
 * );
 */
export function useModalKeyboard(
  isOpen: boolean,
  onClose: () => void,
  onNavigate: (targetPartId: string) => void,
  adjacentParts: AdjacentPartsInfo | null,
  enableNavigation: boolean
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on ESC
      if (event.key === KEYBOARD_SHORTCUTS.CLOSE || event.key === KEYBOARD_SHORTCUTS.CLOSE_LEGACY) {
        onClose();
        return;
      }

      // Navigation shortcuts
      if (!enableNavigation || !adjacentParts) return;

      if (event.key === KEYBOARD_SHORTCUTS.PREV && adjacentParts.prev_id) {
        onNavigate(adjacentParts.prev_id);
      } else if (event.key === KEYBOARD_SHORTCUTS.NEXT && adjacentParts.next_id) {
        onNavigate(adjacentParts.next_id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate, enableNavigation, adjacentParts]);
}

/**
 * Prevents body scroll when modal is open (accessibility best practice)
 * 
 * @param isOpen - Whether modal is open
 * 
 * @example
 * useBodyScrollLock(isOpen);
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);
}
