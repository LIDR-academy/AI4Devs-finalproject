/**
 * ValidationReportModal Component (T-032-FRONT)
 * 
 * Modal component for displaying validation reports with tabs for
 * nomenclature errors, geometry errors, and extracted metadata.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ValidationReportModalProps, TabName, GroupedErrors } from '../types/validation-modal';
import type { ValidationErrorItem } from '../types/validation';
import { groupErrorsByCategory, formatValidatedAt, getErrorCountForCategory } from '../utils/validation-report.utils';
import { TAB_LABELS, ICON_MAP, COLOR_SCHEME, ARIA_LABELS, MODAL_CONFIG } from './validation-report-modal.constants';

/**
 * Helper function to render error list for a category
 * @param errors - Array of validation errors
 * @param categoryName - Name of the category for accessibility
 */
function renderErrorList(errors: ValidationErrorItem[], categoryName: string): JSX.Element {
  return (
    <div>
      {errors.map((error, index) => (
        <div 
          key={index} 
          style={{ 
            marginBottom: '8px', 
            padding: '8px', 
            border: `1px solid ${COLOR_SCHEME.error}`, 
            borderRadius: '4px' 
          }}
        >
          <div style={{ color: COLOR_SCHEME.error }}>
            {ICON_MAP.error} {error.target ? <code>{error.target}</code> : null}
          </div>
          <div>{error.message}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Helper function to render success message when no errors exist
 * @param categoryName - Name of the category (e.g., "nomenclature", "geometry")
 */
function renderSuccessMessage(categoryName: string): JSX.Element {
  return (
    <div style={{ color: COLOR_SCHEME.success }}>
      {ICON_MAP.success} All {categoryName} checks passed
    </div>
  );
}

/**
 * ValidationReportModal component.
 * 
 * Displays a modal with validation results organized in tabs.
 * Supports keyboard navigation and accessibility features.
 * 
 * @param props - Component props
 * @returns Modal portal or null if not open
 */
export function ValidationReportModal(props: ValidationReportModalProps): JSX.Element | null {
  const { report, isOpen, onClose, blockId, isoCode } = props;
  
  // Group errors by category
  const groupedErrors = report ? groupErrorsByCategory(report.errors) : {
    nomenclature: [],
    geometry: [],
    other: [],
  };

  // Determine initial tab based on which categories have errors
  const getInitialTab = (): TabName => {
    if (!report || report.errors.length === 0) {
      return 'nomenclature';
    }
    if (groupedErrors.nomenclature.length > 0) {
      return 'nomenclature';
    }
    if (groupedErrors.geometry.length > 0) {
      return 'geometry';
    }
    return 'metadata';
  };

  const [activeTab, setActiveTab] = useState<TabName>(getInitialTab());

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  // Calculate error counts for badges
  const nomenclatureCount = report ? getErrorCountForCategory(report.errors, 'nomenclature') : 0;
  const geometryCount = report ? getErrorCountForCategory(report.errors, 'geometry') : 0;

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle tab keyboard navigation
  const handleTabKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (activeTab === 'nomenclature') {
        setActiveTab('geometry');
      } else if (activeTab === 'geometry') {
        setActiveTab('metadata');
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (activeTab === 'metadata') {
        setActiveTab('geometry');
      } else if (activeTab === 'geometry') {
        setActiveTab('nomenclature');
      }
    }
  }, [activeTab]);

  // Focus trap - move focus to close button and trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
      if (!modalElement) return [];
      
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.from(modalElement.querySelectorAll<HTMLElement>(focusableSelectors));
    };

    // Focus close button on mount
    const closeButton = document.querySelector('[aria-label="' + ARIA_LABELS.closeButton + '"]') as HTMLButtonElement;
    if (closeButton) {
      closeButton.focus();
    }

    // Intercept Tab key to trap focus
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!report) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', color: COLOR_SCHEME.neutral }}>
          No validation data available
        </div>
      );
    }

    if (activeTab === 'nomenclature') {
      return (
        <div role="tabpanel" aria-labelledby="tab-nomenclature" style={{ padding: '16px' }}>
          {groupedErrors.nomenclature.length === 0 
            ? renderSuccessMessage('nomenclature')
            : renderErrorList(groupedErrors.nomenclature, 'nomenclature')
          }
        </div>
      );
    }

    if (activeTab === 'geometry') {
      return (
        <div role="tabpanel" aria-labelledby="tab-geometry" style={{ padding: '16px' }}>
          {groupedErrors.geometry.length === 0 
            ? renderSuccessMessage('geometry')
            : renderErrorList(groupedErrors.geometry, 'geometry')
          }
        </div>
      );
    }

    if (activeTab === 'metadata') {
      const hasMetadata = report.metadata && Object.keys(report.metadata).length > 0;
      return (
        <div role="tabpanel" aria-labelledby="tab-metadata" style={{ padding: '16px' }}>
          {!hasMetadata ? (
            <div style={{ color: COLOR_SCHEME.neutral }}>
              No metadata extracted
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(report.metadata).map(([key, value]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '8px', fontWeight: 500, textTransform: 'uppercase', fontSize: '13px' }}>
                      {key}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    return null;
  };

  // Modal JSX
  const modalContent = (
    <div
      data-testid="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: MODAL_CONFIG.backdropColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: MODAL_CONFIG.zIndex,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 id="modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              Validation Report
            </h2>
            <button
              onClick={onClose}
              aria-label={ARIA_LABELS.closeButton}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ×
            </button>
          </div>
          {isoCode && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: COLOR_SCHEME.neutral }}>
              {isoCode}
            </div>
          )}
          {report?.is_valid !== undefined && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: report.is_valid ? COLOR_SCHEME.success : COLOR_SCHEME.error }}>
              {report.is_valid ? ICON_MAP.success : ICON_MAP.error} {report.is_valid ? 'Valid' : 'Invalid'}
            </div>
          )}
        </div>

        {/* Summary */}
        {report && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e0e0e0', fontSize: '14px' }}>
            {report.validated_at && (
              <div>Validated: {formatValidatedAt(report.validated_at)}</div>
            )}
            {report.validated_by && (
              <div>By: {report.validated_by}</div>
            )}
            {report.errors && (
              <div>Total Errors: {report.errors.length}</div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div role="tablist" aria-label={ARIA_LABELS.tabList} style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', padding: '0 24px' }}>
          <button
            id="tab-nomenclature"
            role="tab"
            aria-selected={activeTab === 'nomenclature'}
            onClick={() => setActiveTab('nomenclature')}
            onKeyDown={handleTabKeyDown}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'nomenclature' ? `2px solid ${COLOR_SCHEME.info}` : 'none',
              fontWeight: activeTab === 'nomenclature' ? 500 : 400,
            }}
          >
            {TAB_LABELS.nomenclature} {nomenclatureCount > 0 && `(${nomenclatureCount})`}
          </button>
          <button
            id="tab-geometry"
            role="tab"
            aria-selected={activeTab === 'geometry'}
            onClick={() => setActiveTab('geometry')}
            onKeyDown={handleTabKeyDown}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'geometry' ? `2px solid ${COLOR_SCHEME.info}` : 'none',
              fontWeight: activeTab === 'geometry' ? 500 : 400,
            }}
          >
            {TAB_LABELS.geometry} {geometryCount > 0 && `(${geometryCount})`}
          </button>
          <button
            id="tab-metadata"
            role="tab"
            aria-selected={activeTab === 'metadata'}
            onClick={() => setActiveTab('metadata')}
            onKeyDown={handleTabKeyDown}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'metadata' ? `2px solid ${COLOR_SCHEME.info}` : 'none',
              fontWeight: activeTab === 'metadata' ? 500 : 400,
            }}
          >
            {TAB_LABELS.metadata}
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );

  // Render using Portal
  return createPortal(modalContent, document.body);
}
