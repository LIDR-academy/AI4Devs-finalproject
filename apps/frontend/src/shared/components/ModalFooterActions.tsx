import React from 'react';
import styles from './ModalFooterActions.module.css';

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
  /** US-007 v1.1.0 / TK-111-FE: deshabilita el confirmar por una razón distinta de "enviando" (ej. falta stock en la vista previa). Se combina con `isSubmitting`, no lo reemplaza. */
  disabled?: boolean;
}

type ConfirmButtonProps = Required<
  Pick<ModalFooterActionsProps, 'confirmLabel' | 'submittingLabel' | 'confirmVariant' | 'confirmType' | 'isSubmitting' | 'disabled'>
> &
  Pick<ModalFooterActionsProps, 'confirmIcon' | 'onConfirm'>;

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  confirmLabel,
  submittingLabel,
  confirmIcon,
  confirmVariant,
  confirmType,
  onConfirm,
  isSubmitting,
  disabled,
}) => (
  <button
    type={confirmType}
    onClick={confirmType === 'button' ? onConfirm : undefined}
    className={`btn-touch btn-${confirmVariant} ${styles['flex-double']} flex-center flex-gap-xs`}
    disabled={isSubmitting || disabled}
  >
    {confirmIcon}
    {isSubmitting ? submittingLabel : confirmLabel}
  </button>
);

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
  disabled = false,
}) => {
  return (
    <div className={`modal-footer-actions${noMarginTop ? ' no-margin-top' : ''}`}>
      <button type="button" className="btn-touch btn-secondary flex-1" onClick={onCancel}>
        {cancelLabel}
      </button>
      <ConfirmButton
        confirmLabel={confirmLabel}
        submittingLabel={submittingLabel}
        confirmIcon={confirmIcon}
        confirmVariant={confirmVariant}
        confirmType={confirmType}
        onConfirm={onConfirm}
        isSubmitting={isSubmitting}
        disabled={disabled}
      />
    </div>
  );
};
