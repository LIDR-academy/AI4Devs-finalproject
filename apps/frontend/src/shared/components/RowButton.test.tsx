import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RowButton } from './RowButton.js';

describe('TK-086-FE: RowButton', () => {
  it('es <button type="button"> con .btn-touch y la clase de variante', () => {
    const { rerender } = render(<RowButton>Usar</RowButton>);
    const btn = screen.getByRole('button', { name: 'Usar' });
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass('btn-touch');
    expect(btn.className).toMatch(/row-btn--default/);
    rerender(<RowButton variant="urgent">Usar</RowButton>);
    expect(screen.getByRole('button', { name: 'Usar' }).className).toMatch(/row-btn--urgent/);
    rerender(<RowButton variant="ghost">Cancelar</RowButton>);
    expect(screen.getByRole('button', { name: 'Cancelar' }).className).toMatch(/row-btn--ghost/);
  });

  it('reenvía props nativas (onClick, disabled)', () => {
    const onClick = vi.fn();
    const { rerender } = render(<RowButton onClick={onClick}>Usar</RowButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Usar' }));
    expect(onClick).toHaveBeenCalledOnce();
    rerender(<RowButton disabled onClick={onClick}>Usar</RowButton>);
    expect(screen.getByRole('button', { name: 'Usar' })).toBeDisabled();
  });
});
