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

  it('aplica el tamano y el centrado solicitados via className (sin estilos inline, Guard 29 extendido)', () => {
    const { container } = render(
      <Modal size="sm" centered>
        <p>x</p>
      </Modal>
    );

    const card = container.querySelector('.modal-card') as HTMLElement;
    expect(card.className).toContain('modal-sm');
    expect(card.className).toContain('modal-centered');
  });

  it('usa el tamano "md" por defecto si no se especifica', () => {
    const { container } = render(
      <Modal>
        <p>x</p>
      </Modal>
    );

    const card = container.querySelector('.modal-card') as HTMLElement;
    expect(card.className).toContain('modal-md');
    expect(card.className).not.toContain('modal-centered');
  });
});
