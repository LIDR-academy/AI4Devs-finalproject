import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal.js';
import { ModalHeader } from './ModalHeader.js';
import { ModalFooterActions } from './ModalFooterActions.js';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reemplazo táctil de `window.confirm` (Guard 38): confirmación destructiva
 * integrada en la UI, compuesta con Modal/ModalHeader/ModalFooterActions ya existentes.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal maxWidth="420px" width="90%">
      <ModalHeader icon={<AlertTriangle style={{ color: 'var(--color-danger)' }} />} title={title} onClose={onCancel} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '8px' }}>{message}</p>
      <ModalFooterActions
        onCancel={onCancel}
        confirmLabel={confirmLabel}
        submittingLabel={confirmLabel}
        confirmVariant="danger"
        confirmType="button"
        onConfirm={onConfirm}
      />
    </Modal>
  );
};
