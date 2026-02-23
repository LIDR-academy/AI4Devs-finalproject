/**
 * PartDetailModal Component
 * T-0508-FRONT: Part selection and modal integration
 * 
 * @remarks
 * This is a PLACEHOLDER modal for T-0508. US-010 will extend this with:
 * - Full 3D viewer in modal
 * - Metadata tabs (geometry, validation, history)
 * - Timeline of status changes
 * 
 * @module PartDetailModal
 */

import React, { useEffect, useRef } from 'react';
import type { PartDetailModalProps } from '@/types/modal';
import { DESELECTION_KEYS, SELECTION_ARIA_LABELS } from '@/constants/selection.constants';
import { STATUS_COLORS } from '@/constants/dashboard3d.constants';

export const PartDetailModal: React.FC<PartDetailModalProps> = ({
  isOpen,
  part,
  onClose,
}) => {
  const closeCalledRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      // Support both 'Escape' and legacy 'Esc' key
      if (event.key === DESELECTION_KEYS.ESCAPE || event.key === DESELECTION_KEYS.ESC) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset closeCalledRef when modal reopens
  useEffect(() => {
    if (isOpen) {
      closeCalledRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    // Debounce: Only call onClose once per modal open
    if (closeCalledRef.current) return;
    closeCalledRef.current = true;
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking backdrop, not modal content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const workshopName = part?.workshop_name || 'Sin asignar';
  const statusColor = part ? STATUS_COLORS[part.status] : '#6B7280';

  return (
    <div
      data-testid="modal-backdrop"
      role="dialog"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '600px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#111827',
            }}
          >
            {part?.iso_code || 'N/A'}
          </h2>
          <button
            onClick={handleClose}
            aria-label={SELECTION_ARIA_LABELS.MODAL_CLOSE_BUTTON}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 8px',
              color: '#6B7280',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        {part ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Status */}
            <div>
              <strong style={{ color: '#6B7280', fontSize: '0.875rem' }}>Estado:</strong>
              <div
                style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: statusColor,
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {part.status}
              </div>
            </div>

            {/* Tipología */}
            <div>
              <strong style={{ color: '#6B7280', fontSize: '0.875rem' }}>Tipología:</strong>
              <span style={{ marginLeft: '8px', fontSize: '0.875rem' }}>{part.tipologia}</span>
            </div>

            {/* Workshop */}
            <div>
              <strong style={{ color: '#6B7280', fontSize: '0.875rem' }}>Taller:</strong>
              <span style={{ marginLeft: '8px', fontSize: '0.875rem' }}>{workshopName}</span>
            </div>

            {/* Placeholder message for US-010 */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#F3F4F6',
                borderRadius: '4px',
                color: '#6B7280',
                fontSize: '0.875rem',
              }}
            >
              📋 Detalles completos disponibles en US-010
            </div>
          </div>
        ) : (
          <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            No hay información de pieza disponible.
          </div>
        )}
      </div>
    </div>
  );
};
