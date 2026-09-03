import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FEFOInventoryHealthBar } from './FEFOInventoryHealthBar.js';
import type { RemanenteFEFOItem } from '../services/kitchen.service.js';

const mk = (id: string, hoursRemaining: number): RemanenteFEFOItem => ({
  id,
  insumoId: `i-${id}`,
  insumoName: `Insumo ${id}`,
  unitOfMeasure: 'KG',
  currentQuantity: '1',
  initialQuantity: '2',
  location: 'KITCHEN_FRIDGE',
  expirationDate: '2026-09-10',
  hoursRemaining,
  isCriticalAlert: hoursRemaining < 24,
  status: 'ACTIVE',
});

describe('TK-087-FE: FEFOInventoryHealthBar', () => {
  it('con 0 remanentes no renderiza nada', () => {
    const { container } = render(<FEFOInventoryHealthBar remanentes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('la barra tiene role="img" y un aria-label con los mismos números que la leyenda', () => {
    // 2 críticos (<24), 1 próximo (<48), 1 vigente -> 50% / 25% / 25%
    const remanentes = [mk('a', 3), mk('b', 10), mk('c', 30), mk('d', 100)];
    render(<FEFOInventoryHealthBar remanentes={remanentes} />);
    const bar = screen.getByRole('img');
    expect(bar.getAttribute('aria-label')).toMatch(/25% vigente \(1\).*25% próximo \(1\).*50% crítico \(2\)/);
    // leyenda numérica visible
    expect(screen.getByText(/25% vigente \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/50% crítico \(2\)/)).toBeInTheDocument();
  });

  it('modo embedded no renderiza la tarjeta ni la cabecera larga', () => {
    render(<FEFOInventoryHealthBar remanentes={[mk('a', 3)]} embedded />);
    expect(screen.queryByText(/Estado de Salud del Inventario FEFO/i)).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
