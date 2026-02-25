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
 * @returns Object with partData, loading state, and error state
 * 
 * @example
 * const { partData, loading, error } = usePartDetail(partId, isOpen);
 */
export function usePartDetail(partId: string, isOpen: boolean) {
  const [partData, setPartData] = useState<PartDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isOpen || !partId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPartDetail(partId);
        setPartData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(ERROR_MESSAGES.GENERIC_ERROR));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, partId]);

  return { partData, loading, error };
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
