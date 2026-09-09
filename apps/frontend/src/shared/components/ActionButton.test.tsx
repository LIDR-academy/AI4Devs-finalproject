import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButton } from './ActionButton.js';

describe('TK-086-FE: ActionButton', () => {
  it('renderiza label, hint e icono, y es un <button type="button">', () => {
    render(<ActionButton action="extract" label="Extraer" hint="bodega → cocina" icon={<svg data-testid="ic" />} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Extraer' });
    expect(btn).toHaveAttribute('type', 'button');
    expect(screen.getByText('Extraer')).toBeInTheDocument();
    expect(screen.getByText('bodega → cocina')).toBeInTheDocument();
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });

  it('aplica la clase de la capa de acción correspondiente (no urgencia)', () => {
    const { rerender } = render(<ActionButton action="extract" label="Extraer" icon={null} onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Extraer' }).className).toMatch(/circle--extract/);
    rerender(<ActionButton action="recipe" label="Receta" icon={null} onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Receta' }).className).toMatch(/circle--recipe/);
    rerender(<ActionButton action="add" label="Agregar" icon={null} onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Agregar' }).className).toMatch(/circle--add/);
  });

  it('dispara onClick', () => {
    const onClick = vi.fn();
    render(<ActionButton action="add" label="Agregar" icon={null} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
