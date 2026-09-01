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
  noMarginTop?: boolean;
}

/**
 * Footer compartido Cancelar/Confirmar de DiscardModal/RecipeSelectorModal/WarehouseExtractionModal.
 * confirmType='submit' (por defecto) depende de un <form onSubmit> en el padre;
 * confirmType='button' usa onConfirm directo (caso RecipeSelectorModal, que no usa <form>).
 *
 * `noMarginTop` reemplaza el antiguo prop `marginTop` de string libre: solo
 * RecipeSelectorModal necesitaba 0px, el resto usa el margen por defecto de
 * `.modal-footer-actions` (Guard 29 extendido).
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
  noMarginTop = false,
}) => {
  return (
    <div className={`modal-footer-actions${noMarginTop ? ' no-margin-top' : ''}`}>
      <button type="button" className="btn-touch btn-secondary flex-1" onClick={onCancel}>
        {cancelLabel}
      </button>
      <button
        type={confirmType}
        onClick={confirmType === 'button' ? onConfirm : undefined}
        className={`btn-touch btn-${confirmVariant} flex-double flex-center flex-gap-xs`}
        disabled={isSubmitting}
      >
        {confirmIcon}
        {isSubmitting ? submittingLabel : confirmLabel}
      </button>
    </div>
  );
};
