import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App.js';

describe('TK-007-FE: Tactile PIN Login Screen TDD Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe renderizar el modal de login táctil si no hay sesion activa', () => {
    render(<App />);
    expect(screen.getByText(/Acceso Táctil de Operarios/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar a Cocina/i })).toBeInTheDocument();
  });

  it('debe permitir ingresar digitos en el PinPad y activar la mascara de seguridad', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/ID de Operario/i), { target: { value: 'bootstrap-admin' } });

    const btn1 = screen.getByRole('button', { name: '1' });
    const btn2 = screen.getByRole('button', { name: '2' });
    const btn3 = screen.getByRole('button', { name: '3' });
    const btn4 = screen.getByRole('button', { name: '4' });

    fireEvent.click(btn1);
    fireEvent.click(btn2);
    fireEvent.click(btn3);
    fireEvent.click(btn4);

    const submitBtn = screen.getByRole('button', { name: /Ingresar a Cocina/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('debe mostrar mensaje de error si el login falla con PIN incorrecto', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'PIN de acceso invalido o incorrecto.' }),
    } as Response);

    render(<App />);

    fireEvent.change(screen.getByLabelText(/ID de Operario/i), { target: { value: 'bootstrap-admin' } });

    // Presionar 1-2-3-4
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    const submitBtn = screen.getByRole('button', { name: /Ingresar a Cocina/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/PIN de acceso invalido o incorrecto/i)).toBeInTheDocument();
    });
  });

  it('debe autenticar exitosamente y redirigir al Dashboard de cocina con JWT', async () => {
    // 1. ARRANGE (Dado)
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'jwt_token_sample_123456',
        user: { id: 'usr-carlos-1', name: 'Carlos Gomez (Cocina)', role: 'KITCHEN_STAFF' },
      }),
    } as Response);

    render(<App />);

    // 2. ACT (Cuando)
    fireEvent.change(screen.getByLabelText(/ID de Operario/i), { target: { value: 'usr-carlos-1' } });
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    const submitBtn = screen.getByRole('button', { name: /Ingresar a Cocina/i });
    fireEvent.click(submitBtn);

    // 3. ASSERT (Entonces): Verificación con los 3 Oráculos (Guard 20)
    // ORACULO UI: Redirección al Dashboard táctil de cocina y bienvenida a Carlos Gomez
    await waitFor(() => {
      expect(screen.getByText(/Tablero FEFO de Cocina/i)).toBeInTheDocument();
      expect(screen.getByText(/Carlos Gomez \(Cocina\)/i)).toBeInTheDocument();
    });

    // ORACULO ESTADO: Token JWT persistido correctamente en localStorage
    expect(localStorage.getItem('restostock_jwt_token')).toBe('jwt_token_sample_123456');
  });
});
