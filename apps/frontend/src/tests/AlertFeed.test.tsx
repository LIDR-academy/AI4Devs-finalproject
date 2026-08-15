import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlertFeed } from '../features/kitchen/components/AlertFeed';
import { SemaphoricCard, AlertItem } from '../features/kitchen/components/SemaphoricCard';
import { OfflineBanner } from '../features/kitchen/components/OfflineBanner';

const mockAlerts: AlertItem[] = [
  {
    id: 'ALT-001',
    ingredientName: 'Crema de Leche',
    lotNumber: 'LOT-9988',
    hoursRemaining: 3,
    quantity: '2.5',
    unit: 'Litros',
  },
  {
    id: 'ALT-002',
    ingredientName: 'Queso Mozzarella',
    lotNumber: 'LOT-1122',
    hoursRemaining: 18,
    quantity: '5.0',
    unit: 'Kg',
  },
];

describe('TK-007: AlertFeed & Semaphoric Cards', () => {
  it('renders critical red alert for items expiring in less than 6 hours', () => {
    render(<SemaphoricCard alert={mockAlerts[0]} />);

    expect(screen.getByText('Crema de Leche')).toBeInTheDocument();
    expect(screen.getByText('CRÍTICO (< 6h)')).toBeInTheDocument();
    expect(screen.getByText(/Vence en 3h/)).toBeInTheDocument();
  });

  it('renders warning yellow alert for items expiring in less than 24 hours', () => {
    render(<SemaphoricCard alert={mockAlerts[1]} />);

    expect(screen.getByText('Queso Mozzarella')).toBeInTheDocument();
    expect(screen.getByText('ADVERTENCIA (< 24h)')).toBeInTheDocument();
    expect(screen.getByText(/Vence en 18h/)).toBeInTheDocument();
  });

  it('triggers onAction callback with correct parameters when buttons are clicked', () => {
    const handleAction = vi.fn();
    render(<SemaphoricCard alert={mockAlerts[0]} onAction={handleAction} />);

    const consumeBtn = screen.getByRole('button', { name: /Consumir Crema de Leche/i });
    fireEvent.click(consumeBtn);

    expect(handleAction).toHaveBeenCalledWith('ALT-001', 'consume');
  });

  it('renders Empty State when no active alerts are provided', () => {
    render(<AlertFeed alerts={[]} isLoading={false} />);

    expect(screen.getByText('No hay remanentes en riesgo de vencimiento')).toBeInTheDocument();
  });

  it('renders Loading Skeleton state during data fetching', () => {
    render(<AlertFeed isLoading={true} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders Error State with retry button on error', () => {
    const handleRetry = vi.fn();
    render(<AlertFeed error="Fallo al obtener alertas" onRetry={handleRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Fallo al obtener alertas');
    const retryBtn = screen.getByRole('button', { name: /Reintentar Carga/i });
    fireEvent.click(retryBtn);

    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('shows OfflineBanner when network goes offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<OfflineBanner />);

    expect(screen.getByRole('alert')).toHaveTextContent('Modo Sin Conexión');
  });
});
