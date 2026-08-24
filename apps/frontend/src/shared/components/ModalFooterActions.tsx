import React from 'react';

interface ModalFooterActionsProps {
  onCancel: () => void;
  cancelLabel?: string;
  confirmLabel: string;
  submittingLabel: string;
  confirmIcon?: React.ReactNode;
  confirmVariant?: 'primary' | 'danger';
  confirmType?: 'submit' | 'button';
  onConfirm?: () => void;
  isSubmitting?: boolean;
  marginTop?: string;
}

/**
 * Footer compartido Cancelar/Confirmar de DiscardModal/RecipeSelectorModal/WarehouseExtractionModal.
 * confirmType='submit' (por defecto) depende de un <form onSubmit> en el padre;
 * confirmType='button' usa onConfirm directo (caso RecipeSelectorModal, que no usa <form>).
 */
export const ModalFooterActions: React.FC<ModalFooterActionsProps> = ({
  onCancel,
  cancelLabel = 'Cancelar',
  confirmLabel,
  submittingLabel,
  confirmIcon,
  confirmVariant = 'primary',
  confirmType = 'submit',
  onConfirm,
  isSubmitting = false,
  marginTop = '16px',
}) => {
  return (
    <div style={{ display: 'flex', gap: '12px', marginTop }}>
      <button type="button" className="btn-touch btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
        {cancelLabel}
      </button>
      <button
        type={confirmType}
        onClick={confirmType === 'button' ? onConfirm : undefined}
        className={`btn-touch btn-${confirmVariant}`}
        disabled={isSubmitting}
        style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
      >
        {confirmIcon}
        {isSubmitting ? submittingLabel : confirmLabel}
      </button>
    </div>
  );
};
