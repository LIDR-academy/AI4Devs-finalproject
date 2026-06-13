import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSelector } from './color-selector';

describe('ColorSelector', () => {
  it('no renderiza nada si colors es vacío', () => {
    const { container } = render(
      <ColorSelector colors={[]} selectedColor={null} onSelect={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza un botón por color', () => {
    render(
      <ColorSelector colors={['Negro', 'Rojo']} selectedColor={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Negro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rojo' })).toBeInTheDocument();
  });

  it('marca visualmente el color seleccionado con aria-pressed="true"', () => {
    render(
      <ColorSelector colors={['Negro', 'Rojo']} selectedColor="Rojo" onSelect={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Rojo' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Negro' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('llama a onSelect con el color correcto al hacer click', async () => {
    const onSelect = vi.fn();
    render(
      <ColorSelector colors={['Negro', 'Rojo']} selectedColor={null} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Negro' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('Negro');
  });
});
