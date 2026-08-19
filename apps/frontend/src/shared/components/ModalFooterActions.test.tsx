import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalFooterActions } from './ModalFooterActions.js';

describe('ModalFooterActions — patron compartido Cancelar/Confirmar de Discard/RecipeSelector/WarehouseExtraction modals', () => {
  it('renderiza el label de cancelar y el label de confirmar', () => {
    render(
      <ModalFooterActions onCancel={() => {}} confirmLabel="Confirmar Merma" submittingLabel="Procesando..." />
    );

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Merma/i })).toBeInTheDocument();
  });

  it('invoca onCancel al hacer click en Cancelar', () => {
    const onCancel = vi.fn();
    render(<ModalFooterActions onCancel={onCancel} confirmLabel="Confirmar" submittingLabel="..." />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('muestra el submittingLabel y deshabilita el boton de confirmar cuando isSubmitting es true', () => {
    render(
      <ModalFooterActions
        onCancel={() => {}}
        confirmLabel="Confirmar"
        submittingLabel="Procesando..."
        isSubmitting
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /Procesando/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('el boton de confirmar es type="submit" por defecto (comportamiento original de forms con onSubmit)', () => {
    render(<ModalFooterActions onCancel={() => {}} confirmLabel="Confirmar" submittingLabel="..." />);

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
    expect(confirmBtn).toHaveAttribute('type', 'submit');
  });

  it('permite type="button" + onConfirm para modales sin <form> (caso RecipeSelectorModal)', () => {
    const onConfirm = vi.fn();
    render(
      <ModalFooterActions
        onCancel={() => {}}
        onConfirm={onConfirm}
        confirmType="button"
        confirmLabel="Confirmar Preparación"
        submittingLabel="Descontando FEFO..."
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /Confirmar Preparación/i });
    expect(confirmBtn).toHaveAttribute('type', 'button');
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
