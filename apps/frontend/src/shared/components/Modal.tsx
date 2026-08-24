import React from 'react';

interface ModalProps {
  maxWidth?: string;
  width?: string;
  textAlign?: React.CSSProperties['textAlign'];
  padding?: string;
  children: React.ReactNode;
}

/**
 * Shell compartido de overlay + card, usando las clases CSS `.modal-overlay`/`.modal-card`
 * ya existentes en index.css. Antes, DiscardModal/WarehouseExtractionModal/PinLoginModal
 * repetian este mismo par de <div> y RecipeSelectorModal lo reimplementaba con estilos
 * inline en vez de usar esas clases.
 */
export const Modal: React.FC<ModalProps> = ({ maxWidth = '500px', width = '90%', textAlign, padding, children }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth, width, textAlign, padding }}>
        {children}
      </div>
    </div>
  );
};
