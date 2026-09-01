import React from 'react';

interface ModalProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  children: React.ReactNode;
}

/**
 * Shell compartido de overlay + card, usando las clases CSS `.modal-overlay`/`.modal-card`
 * ya existentes en index.css. Antes, DiscardModal/WarehouseExtractionModal/PinLoginModal
 * repetian este mismo par de <div> y RecipeSelectorModal lo reimplementaba con estilos
 * inline en vez de usar esas clases.
 *
 * `size` reemplaza el antiguo prop `maxWidth` (string libre en px): agrupa los ~19 valores
 * casi unicos que existian en la app en 4 tamanos fijos (Guard 29 extendido).
 */
export const Modal: React.FC<ModalProps> = ({ size = 'md', centered = false, children }) => {
  const className = `modal-card modal-${size}${centered ? ' modal-centered' : ''}`;
  return (
    <div className="modal-overlay">
      <div className={className}>{children}</div>
    </div>
  );
};
