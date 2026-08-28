import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  icon: React.ReactNode;
  title: string;
  titleColor?: string;
  fontSize?: string;
  gap?: string;
  marginBottom?: string;
  onClose?: () => void;
}

/**
 * Header compartido de icono + titulo + boton de cerrar opcional.
 * Usado por DiscardModal/RecipeSelectorModal/WarehouseExtractionModal.
 * PinLoginModal no lo usa: es la pantalla de login obligatoria, sin boton de cerrar.
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  icon,
  title,
  titleColor = 'var(--text-primary)',
  fontSize = '1.3rem',
  gap = '8px',
  marginBottom = '16px',
  onClose,
}) => {
  return (
    <div className="flex-between" style={{ marginBottom }}>
      <h2 className="flex-gap-xs" style={{ fontSize, fontWeight: 700, color: titleColor, gap }}>
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
