/**
 * PartDetailModal Component
 * T-0508-FRONT: Part selection and modal integration
 * T-1007-FRONT: Modal Integration - 3D Viewer with Tabs & Navigation
 * 
 * @remarks
 * Full-featured modal with 3D viewer, tabs, and prev/next navigation.
 * Fetches own data via partId prop (decoupled from Dashboard3D state).
 * Renders via Portal with high z-index (9999) to appear above all Dashboard elements.
 * 
 * REFACTORED 2026-02-25: Extracted custom hooks (usePartDetail, usePartNavigation, 
 * useModalKeyboard, useBodyScrollLock) and helper functions (error mapping, tab rendering)
 * for better testability and separation of concerns.
 * 
 * @module PartDetailModal
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { PartDetailModalProps, TabId } from '@/types/modal';
import {
  MODAL_STYLES,
  TAB_CONFIG,
  ARIA_LABELS,
  DEFAULTS,
} from './PartDetailModal.constants';
import {
  usePartDetail,
  usePartNavigation,
  useModalKeyboard,
  useBodyScrollLock,
} from './PartDetailModal.hooks';
import {
  renderErrorState,
  renderMetadataTab,
  renderValidationTab,
  renderViewerTab,
} from './PartDetailModal.helpers';

/**
 * PartDetailModal - Full-featured modal for part details with 3D viewer
 * 
 * @param props - Component props (see PartDetailModalProps)
 * @returns React Portal rendering modal content, or null if closed
 * 
 * @example
 * <PartDetailModal
 *   isOpen={!!selectedId}
 *   partId={selectedId}
 *   onClose={() => clearSelection()}
 *   enableNavigation={true}
 *   filters={{ status: ['validated'] }}
 * />
 */
export const PartDetailModal: React.FC<PartDetailModalProps> = ({
  isOpen,
  partId,
  onClose,
  initialTab = DEFAULTS.INITIAL_TAB,
  enableNavigation = DEFAULTS.ENABLE_NAVIGATION,
  filters = null,
}) => {
  // Local state for current part ID (enables internal navigation)
  const [currentPartId, setCurrentPartId] = useState<string>(partId);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const closeCalledRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Custom hooks for data fetching
  const { partData, loading, error, retry } = usePartDetail(currentPartId, isOpen);
  const { adjacentParts, navigationLoading } = usePartNavigation(
    currentPartId,
    isOpen,
    enableNavigation,
    filters
  );

  // Sync internal currentPartId with prop partId when modal reopens or parent changes selection
  useEffect(() => {
    if (isOpen) {
      setCurrentPartId(partId);
    }
  }, [isOpen, partId]);

  // Reset closeCalledRef when modal reopens (prevents debouncing issues)
  useEffect(() => {
    if (isOpen) {
      closeCalledRef.current = false;
    }
  }, [isOpen]);

  /**
   * Handles modal close with debouncing to prevent double-calls
   */
  const handleClose = () => {
    if (closeCalledRef.current) return;
    closeCalledRef.current = true;
    onClose();
  };

  /**
   * Handles backdrop click (only closes if clicking backdrop, not modal content)
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  /**
   * Handles navigation to another part (triggered by prev/next buttons or keyboard)
   */
  const handleNavigate = (targetPartId: string) => {
    setCurrentPartId(targetPartId);
  };

  /**
   * Handles previous button click
   */
  const handlePrevClick = () => {
    if (adjacentParts?.prev_id && !navigationLoading) {
      handleNavigate(adjacentParts.prev_id);
    }
  };

  /**
   * Handles next button click
   */
  const handleNextClick = () => {
    if (adjacentParts?.next_id && !navigationLoading) {
      handleNavigate(adjacentParts.next_id);
    }
  };

  // Apply custom hooks for keyboard shortcuts and body scroll lock
  useModalKeyboard(isOpen, handleClose, handleNavigate, adjacentParts, enableNavigation);
  useBodyScrollLock(isOpen);

  // Focus trap: Capture focus when modal opens and manage Tab cycling (A11Y-INT-02)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Get focusable elements in VISUAL order (not DOM order):
    // 1. Tabs (Visor 3D, Metadatos, Validación)
    // 2. Navigation buttons (Prev, Next) - only if enabled
    // 3. Close button
    const tabs = Array.from(modalRef.current.querySelectorAll<HTMLElement>('[role="tab"]'));
    const prevButton = modalRef.current.querySelector<HTMLElement>('[aria-label*="anterior"]');
    const nextButton = modalRef.current.querySelector<HTMLElement>('[aria-label*="siguiente"]');
    const closeButton = modalRef.current.querySelector<HTMLElement>('[aria-label*="Cerrar"]');
    
    // Build ordered list of focusable elements (visual order, filter disabled buttons)
    const focusableElements: HTMLElement[] = [...tabs];
    if (prevButton && !prevButton.hasAttribute('disabled')) focusableElements.push(prevButton);
    if (nextButton && !nextButton.hasAttribute('disabled')) focusableElements.push(nextButton);
    if (closeButton) focusableElements.push(closeButton);

    // Handle Tab key to trap focus within modal
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      // Always prevent default to implement custom tab order
      event.preventDefault();

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      
      // If focus is outside modal, move to first element
      if (currentIndex === -1) {
        focusableElements[0]?.focus();
        return;
      }

      // Shift+Tab: move backward (with wraparound)
      if (event.shiftKey) {
        const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[prevIndex]?.focus();
      }
      // Tab: move forward (with wraparound)
      else {
        const nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
        focusableElements[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, partData, error, activeTab]); // Re-run when content changes

  // Don't render if modal is closed
  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div
      data-testid="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={ARIA_LABELS.MODAL}
      onClick={handleBackdropClick}
      style={MODAL_STYLES.backdrop}
    >
      <div ref={modalRef} style={MODAL_STYLES.container} onClick={(e) => e.stopPropagation()}>
        {/* Header with ISO code, position indicator, and navigation buttons */}
        <div style={MODAL_STYLES.header}>
          <div style={MODAL_STYLES.headerLeft}>
            <h2 style={MODAL_STYLES.headerTitle}>
              {partData?.iso_code || (loading ? 'Cargando...' : 'N/A')}
            </h2>
            {adjacentParts && (
              <div style={MODAL_STYLES.headerSubtitle} aria-label={ARIA_LABELS.POSITION_INDICATOR}>
                Pieza {adjacentParts.current_index + 1} de {adjacentParts.total_count}
              </div>
            )}
          </div>
          <div style={MODAL_STYLES.headerRight}>
            {enableNavigation && adjacentParts && (
              <>
                <button
                  onClick={handlePrevClick}
                  disabled={!adjacentParts.prev_id || navigationLoading}
                  aria-label={ARIA_LABELS.PREV_BUTTON}
                  style={{
                    ...MODAL_STYLES.navButton,
                    ...((!adjacentParts.prev_id || navigationLoading) && MODAL_STYLES.navButtonDisabled),
                  }}
                >
                  ←
                </button>
                <button
                  onClick={handleNextClick}
                  disabled={!adjacentParts.next_id || navigationLoading}
                  aria-label={ARIA_LABELS.NEXT_BUTTON}
                  style={{
                    ...MODAL_STYLES.navButton,
                    ...((!adjacentParts.next_id || navigationLoading) && MODAL_STYLES.navButtonDisabled),
                  }}
                >
                  →
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              aria-label={ARIA_LABELS.CLOSE_BUTTON}
              style={MODAL_STYLES.closeButton}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Bar - Only show when no error */}
        {!error && (
          <div role="tablist" aria-label={ARIA_LABELS.TAB_LIST} style={MODAL_STYLES.tabBar}>
            {(Object.keys(TAB_CONFIG) as TabId[]).map((tabId) => (
              <button
                key={tabId}
                role="tab"
                aria-selected={activeTab === tabId}
                aria-label={TAB_CONFIG[tabId].label}
                onClick={() => setActiveTab(tabId)}
                style={{
                  ...MODAL_STYLES.tabButton,
                  ...(activeTab === tabId && MODAL_STYLES.tabButtonActive),
                }}
              >
                {TAB_CONFIG[tabId].icon} {TAB_CONFIG[tabId].label}
                {tabId === 'validation' && partData?.validation_report?.is_valid === false && (
                  <span
                    data-testid="validation-error-badge"
                    style={{
                      marginLeft: '6px',
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div style={MODAL_STYLES.tabContent}>
          {/* Loading State */}
          {loading && (
            <div style={MODAL_STYLES.loadingSpinner}>Cargando pieza...</div>
          )}

          {/* Error State */}
          {error && renderErrorState(error, retry)}

          {/* Success State - Render tab content */}
          {!loading && !error && partData && (
            <>
              {activeTab === 'viewer' && renderViewerTab(currentPartId)}
              {activeTab === 'metadata' && renderMetadataTab(partData)}
              {activeTab === 'validation' && renderValidationTab(partData)}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render via Portal to ensure modal appears above all other elements
  return ReactDOM.createPortal(modalContent, document.body);
};
