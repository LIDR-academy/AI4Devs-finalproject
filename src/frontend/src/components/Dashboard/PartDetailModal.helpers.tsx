/**
 * Helper Utilities for PartDetailModal
 * T-1007-FRONT: Modal Integration - Error Mapping & Rendering Utilities
 * 
 * @remarks
 * Extracts error message mapping and tab content rendering logic
 * for better testability and DRY principles.
 * 
 * @module PartDetailModal.helpers
 */

import { ERROR_MESSAGES, MODAL_STYLES } from './PartDetailModal.constants';
import type { PartDetail } from '@/types/parts';
import { ModelLoader } from '@/components/ModelLoader';

/**
 * Maps Error object to user-friendly error messages
 * 
 * @param error - Error object from fetch failure
 * @returns Object with title and detail message
 * 
 * @example
 * const { title, detail } = getErrorMessages(error);
 */
export function getErrorMessages(error: Error): { title: string; detail: string } {
  const messageMap: Record<string, { title: string; detail: string }> = {
    'Part not found': {
      title: ERROR_MESSAGES.PART_NOT_FOUND,
      detail: ERROR_MESSAGES.PART_NOT_FOUND_DETAIL,
    },
    'Access denied': {
      title: ERROR_MESSAGES.ACCESS_DENIED,
      detail: ERROR_MESSAGES.ACCESS_DENIED_DETAIL,
    },
  };

  return messageMap[error.message] || {
    title: ERROR_MESSAGES.FETCH_FAILED,
    detail: ERROR_MESSAGES.FETCH_FAILED_DETAIL,
  };
}

/**
 * Renders error state UI with icon, title, and message
 * 
 * @param error - Error object from fetch failure
 * @returns JSX element with error UI
 * 
 * @example
 * {error && renderErrorState(error)}
 */
export function renderErrorState(error: Error): JSX.Element {
  const { title, detail } = getErrorMessages(error);

  return (
    <div style={MODAL_STYLES.errorContainer}>
      <div style={MODAL_STYLES.errorIcon}>⚠️</div>
      <h3 style={MODAL_STYLES.errorTitle}>{title}</h3>
      <p style={MODAL_STYLES.errorMessage}>{detail}</p>
    </div>
  );
}

/**
 * Renders metadata tab content with formatted JSON
 * 
 * @param partData - Part detail data object
 * @returns JSX element with metadata tab content
 * 
 * @example
 * {activeTab === 'metadata' && renderMetadataTab(partData)}
 */
export function renderMetadataTab(partData: PartDetail): JSX.Element {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Metadatos de la Pieza</h3>
      <pre style={{ fontSize: '0.875rem', overflowX: 'auto' }}>
        {JSON.stringify(partData, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Renders validation tab content with report or empty state
 * 
 * @param partData - Part detail data object
 * @returns JSX element with validation tab content
 * 
 * @example
 * {activeTab === 'validation' && renderValidationTab(partData)}
 */
export function renderValidationTab(partData: PartDetail): JSX.Element {
  if (partData.validation_report) {
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>Reporte de Validación</h3>
        <pre style={{ fontSize: '0.875rem', overflowX: 'auto' }}>
          {JSON.stringify(partData.validation_report, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
      Sin reporte de validación disponible
    </div>
  );
}

/**
 * Renders viewer tab content with ModelLoader component
 * 
 * @param partId - UUID of part to load
 * @returns JSX element with 3D viewer
 * 
 * @example
 * {activeTab === 'viewer' && renderViewerTab(currentPartId)}
 */
export function renderViewerTab(partId: string): JSX.Element {
  return <ModelLoader partId={partId} />;
}
