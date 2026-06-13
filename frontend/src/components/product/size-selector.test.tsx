import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SizeSelector } from './size-selector';

describe('SizeSelector', () => {
  it('no renderiza nada si sizes es vacío', () => {
    const { container } = render(
      <SizeSelector sizes={[]} selectedSize={null} onSelect={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza un botón por talla', () => {
    render(
      <SizeSelector sizes={['40', '41', '42']} selectedSize={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: '40' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '41' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '42' })).toBeInTheDocument();
  });

  it('marca visualmente la talla seleccionada con aria-pressed="true"', () => {
    render(
      <SizeSelector sizes={['40', '41', '42']} selectedSize="41" onSelect={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: '41' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '40' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '42' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('llama a onSelect con la talla correcta al hacer click', async () => {
    const onSelect = vi.fn();
    render(
      <SizeSelector sizes={['40', '41', '42']} selectedSize={null} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole('button', { name: '42' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('42');
  });
});
