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
import { PartMetadataPanel } from './PartMetadataPanel';
import { PartViewerCanvas } from '@/components/PartViewerCanvas';
import { ViewerErrorBoundary } from './ViewerErrorBoundary';

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
    [ERROR_MESSAGES.TIMEOUT]: {
      title: ERROR_MESSAGES.TIMEOUT,
      detail: ERROR_MESSAGES.TIMEOUT_DETAIL,
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
 * @param onRetry - Optional callback to retry the failed operation (for timeout errors)
 * @returns JSX element with error UI
 * 
 * @example
 * {error && renderErrorState(error, handleRetry)}
 */
export function renderErrorState(error: Error, onRetry?: () => void): JSX.Element {
  const { title, detail } = getErrorMessages(error);
  const isTimeout = error.message === ERROR_MESSAGES.TIMEOUT;

  return (
    <div style={MODAL_STYLES.errorContainer}>
      <div style={MODAL_STYLES.errorIcon}>⚠️</div>
      <h3 style={MODAL_STYLES.errorTitle}>{title}</h3>
      <p style={MODAL_STYLES.errorMessage}>{detail}</p>
      {isTimeout && onRetry && (
        <button
          onClick={onRetry}
          aria-label="Reintentar"
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Reintentar
        </button>
      )}
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
  return <PartMetadataPanel part={partData} initialExpandedSection="info" />;
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
    const hasErrors = !partData.validation_report.is_valid && partData.validation_report.errors;
    
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>Reporte de Validación</h3>
        {hasErrors && (
          <>
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
              Errores de validación detectados
            </p>
            <ul data-testid="validation-errors-list" style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
              {partData.validation_report.errors.map((error, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>
                  <strong>{error.category}</strong> ({error.target}): {error.message}
                </li>
              ))}
            </ul>
          </>
        )}
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ver JSON completo</summary>
          <pre style={{ fontSize: '0.875rem', overflowX: 'auto', marginTop: '0.5rem' }}>
            {JSON.stringify(partData.validation_report, null, 2)}
          </pre>
        </details>
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
  return (
    <ViewerErrorBoundary>
      <PartViewerCanvas>
        <ModelLoader partId={partId} />
      </PartViewerCanvas>
    </ViewerErrorBoundary>
  );
}
