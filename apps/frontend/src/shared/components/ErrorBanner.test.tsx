import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertCircle } from 'lucide-react';
import { ErrorBanner } from './ErrorBanner.js';

describe('ErrorBanner — patron compartido de banner de error inline (dedup RecipeSelectorModal/PinLoginModal)', () => {
  it('renderiza el mensaje de error', () => {
    render(<ErrorBanner message="PIN incorrecto. Intente de nuevo." />);
    expect(screen.getByText('PIN incorrecto. Intente de nuevo.')).toBeInTheDocument();
  });

  it('renderiza el icono cuando se provee', () => {
    render(<ErrorBanner message="Error" icon={<AlertCircle data-testid="err-icon" />} />);
    expect(screen.getByTestId('err-icon')).toBeInTheDocument();
  });

  it('tiene role="alert" para accesibilidad', () => {
    render(<ErrorBanner message="Error critico" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error critico');
  });
});
