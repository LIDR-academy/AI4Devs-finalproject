import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductVariantSelector } from './product-variant-selector';

describe('ProductVariantSelector', () => {
  it('no renderiza la sección de tallas cuando sizes está vacío', () => {
    render(<ProductVariantSelector sizes={[]} colors={[]} stock={5} />);
    expect(screen.queryByText('Talla')).not.toBeInTheDocument();
  });

  it('no renderiza la sección de colores cuando colors está vacío', () => {
    render(<ProductVariantSelector sizes={[]} colors={[]} stock={5} />);
    expect(screen.queryByText('Color')).not.toBeInTheDocument();
  });

  it('renderiza la sección de tallas cuando sizes tiene valores', () => {
    render(<ProductVariantSelector sizes={['40', '41']} colors={[]} stock={5} />);
    expect(screen.getByText('Talla')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '40' })).toBeInTheDocument();
  });

  it('muestra error al intentar añadir sin seleccionar talla cuando el producto tiene tallas', async () => {
    render(<ProductVariantSelector sizes={['40', '41']} colors={[]} stock={5} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Por favor, selecciona una talla');
  });

  it('no muestra error si sizes y colors están vacíos', async () => {
    render(<ProductVariantSelector sizes={[]} colors={[]} stock={5} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('limpia el error de talla al seleccionar una talla después del intento fallido', async () => {
    render(<ProductVariantSelector sizes={['40', '41']} colors={[]} stock={5} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '40' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra error al intentar añadir sin seleccionar color cuando el producto tiene colores', async () => {
    render(<ProductVariantSelector sizes={[]} colors={['black', 'red']} stock={5} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Por favor, selecciona un color');
  });

  it('no muestra error de color si colors está vacío', async () => {
    render(<ProductVariantSelector sizes={[]} colors={[]} stock={5} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra los colores con etiqueta en español', () => {
    render(<ProductVariantSelector sizes={[]} colors={['black', 'white', 'red']} stock={5} />);
    expect(screen.getByRole('button', { name: 'Negro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Blanco' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rojo' })).toBeInTheDocument();
  });

  it('limpia el error de color al seleccionar un color después del intento fallido', async () => {
    render(<ProductVariantSelector sizes={[]} colors={['black', 'red']} stock={5} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Negro' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra primero el error de talla cuando faltan talla y color', async () => {
    render(<ProductVariantSelector sizes={['40']} colors={['black']} stock={5} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Por favor, selecciona una talla');
  });

  it('muestra «Agotado» y el botón está deshabilitado cuando stock es 0', () => {
    render(<ProductVariantSelector sizes={[]} colors={[]} stock={0} />);
    const btn = screen.getByRole('button', { name: /agotado/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('el stepper tiene max igual al stock', async () => {
    render(<ProductVariantSelector sizes={[]} colors={[]} stock={3} />);
    const increment = screen.getByRole('button', { name: /aumentar cantidad/i });
    await userEvent.click(increment); // quantity → 2
    await userEvent.click(increment); // quantity → 3
    expect(increment).toBeDisabled();
  });

  it('el stepper empieza en 1 y el botón − está deshabilitado inicialmente', () => {
    render(<ProductVariantSelector sizes={[]} colors={[]} stock={5} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reducir cantidad/i })).toBeDisabled();
  });
});
