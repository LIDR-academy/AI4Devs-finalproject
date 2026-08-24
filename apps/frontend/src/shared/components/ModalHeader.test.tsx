import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertTriangle } from 'lucide-react';
import { ModalHeader } from './ModalHeader.js';

describe('ModalHeader — patron compartido icono + titulo + boton cerrar opcional', () => {
  it('renderiza el icono y el titulo', () => {
    render(<ModalHeader icon={<AlertTriangle data-testid="icon" />} title="Registrar Descarte de Merma" />);

    expect(screen.getByText('Registrar Descarte de Merma')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('no renderiza boton de cerrar si no se pasa onClose (caso PinLoginModal: pantalla de login obligatoria)', () => {
    render(<ModalHeader icon={<AlertTriangle />} title="Sin cerrar" />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renderiza boton de cerrar y lo invoca al hacer click cuando se pasa onClose', () => {
    const onClose = vi.fn();
    render(<ModalHeader icon={<AlertTriangle />} title="Con cerrar" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
