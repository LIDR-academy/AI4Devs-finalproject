import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from './Modal.js';

describe('Modal — shell compartido de overlay + card (dedup de DiscardModal/WarehouseExtractionModal/PinLoginModal/RecipeSelectorModal)', () => {
  it('renderiza los children dentro de las clases CSS modal-overlay/modal-card ya existentes', () => {
    const { container } = render(
      <Modal>
        <p>Contenido del modal</p>
      </Modal>
    );

    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
    expect(container.querySelector('.modal-overlay')).not.toBeNull();
    expect(container.querySelector('.modal-card')).not.toBeNull();
  });

  it('aplica maxWidth, width y textAlign personalizados a la card (preserva estilos por-instancia de cada modal original)', () => {
    const { container } = render(
      <Modal maxWidth="420px" width="100%" textAlign="center">
        <p>x</p>
      </Modal>
    );

    const card = container.querySelector('.modal-card') as HTMLElement;
    expect(card.style.maxWidth).toBe('420px');
    expect(card.style.width).toBe('100%');
    expect(card.style.textAlign).toBe('center');
  });

  it('aplica un padding personalizado a la card cuando se especifica', () => {
    const { container } = render(
      <Modal padding="32px">
        <p>x</p>
      </Modal>
    );

    const card = container.querySelector('.modal-card') as HTMLElement;
    expect(card.style.padding).toBe('32px');
  });

  it('usa maxWidth 500px y width 90% por defecto si no se especifican', () => {
    const { container } = render(
      <Modal>
        <p>x</p>
      </Modal>
    );

    const card = container.querySelector('.modal-card') as HTMLElement;
    expect(card.style.maxWidth).toBe('500px');
    expect(card.style.width).toBe('90%');
  });
});
