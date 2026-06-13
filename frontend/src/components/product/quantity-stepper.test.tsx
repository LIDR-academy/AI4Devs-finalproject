import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuantityStepper } from './quantity-stepper';

describe('QuantityStepper', () => {
  it('muestra la cantidad actual', () => {
    render(<QuantityStepper quantity={3} max={10} onIncrement={vi.fn()} onDecrement={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('deshabilita el botón − cuando quantity es 1', () => {
    render(<QuantityStepper quantity={1} max={10} onIncrement={vi.fn()} onDecrement={vi.fn()} />);
    expect(screen.getByRole('button', { name: /reducir cantidad/i })).toBeDisabled();
  });

  it('no deshabilita el botón − cuando quantity es mayor que 1', () => {
    render(<QuantityStepper quantity={2} max={10} onIncrement={vi.fn()} onDecrement={vi.fn()} />);
    expect(screen.getByRole('button', { name: /reducir cantidad/i })).not.toBeDisabled();
  });

  it('deshabilita el botón + cuando quantity es igual a max', () => {
    render(<QuantityStepper quantity={5} max={5} onIncrement={vi.fn()} onDecrement={vi.fn()} />);
    expect(screen.getByRole('button', { name: /aumentar cantidad/i })).toBeDisabled();
  });

  it('no deshabilita el botón + cuando quantity es menor que max', () => {
    render(<QuantityStepper quantity={2} max={5} onIncrement={vi.fn()} onDecrement={vi.fn()} />);
    expect(screen.getByRole('button', { name: /aumentar cantidad/i })).not.toBeDisabled();
  });

  it('llama a onIncrement al hacer click en + cuando no está deshabilitado', async () => {
    const onIncrement = vi.fn();
    render(<QuantityStepper quantity={2} max={5} onIncrement={onIncrement} onDecrement={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /aumentar cantidad/i }));
    expect(onIncrement).toHaveBeenCalledOnce();
  });

  it('llama a onDecrement al hacer click en − cuando no está deshabilitado', async () => {
    const onDecrement = vi.fn();
    render(<QuantityStepper quantity={2} max={5} onIncrement={vi.fn()} onDecrement={onDecrement} />);
    await userEvent.click(screen.getByRole('button', { name: /reducir cantidad/i }));
    expect(onDecrement).toHaveBeenCalledOnce();
  });

  it('no llama a onDecrement cuando el botón − está deshabilitado', async () => {
    const onDecrement = vi.fn();
    render(<QuantityStepper quantity={1} max={5} onIncrement={vi.fn()} onDecrement={onDecrement} />);
    await userEvent.click(screen.getByRole('button', { name: /reducir cantidad/i }));
    expect(onDecrement).not.toHaveBeenCalled();
  });
});
