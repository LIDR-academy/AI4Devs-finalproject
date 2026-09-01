import React from 'react';
import { X } from 'lucide-react';
import styles from './ModalHeader.module.css';

interface ModalHeaderProps {
  icon: React.ReactNode;
  title: string;
  danger?: boolean;
  size?: 'md' | 'lg';
  onClose?: () => void;
}

/**
 * Header compartido de icono + titulo + boton de cerrar opcional.
 * Usado por DiscardModal/RecipeSelectorModal/WarehouseExtractionModal.
 * PinLoginModal no lo usa: es la pantalla de login obligatoria, sin boton de cerrar.
 *
 * `size`/`danger` reemplazan los antiguos props de string libre (fontSize/gap/
 * marginBottom/titleColor): los 2 combos reales que existian en la app quedan
 * fijos en `.modal-header-md`/`.modal-header-lg` (Guard 29 extendido).
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({ icon, title, danger = false, size = 'md', onClose }) => {
  return (
    <div className={`flex-between ${styles[`modal-header-${size}`]}`}>
      <h2 className={`${styles['modal-header-title']} ${styles[`modal-header-title-${size}`]}${danger ? ' text-danger-color' : ''}`}>
        {icon} {title}
      </h2>
      {onClose && (
        <button type="button" onClick={onClose} className="btn-touch btn-secondary btn-icon">
          <X size={20} />
        </button>
      )}
    </div>
  );
};
