import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.js';

describe('TK-001-FE: Frontend Core & Design System TDD', () => {
  it('debe renderizar el encabezado principal de RestoStock', () => {
    render(<App />);
    const heading = screen.getByText(/RestoStock - Control de Inventario FEFO/i);
    expect(heading).toBeInTheDocument();
  });

  it('debe renderizar el boton de sincronizar con la clase de ergonomia tactil .btn-touch', () => {
    render(<App />);
    const syncButton = screen.getByRole('button', { name: /Sincronizar Remanentes/i });
    expect(syncButton).toBeInTheDocument();
    expect(syncButton).toHaveClass('btn-touch');
  });

  it('debe renderizar el boton de descarte de merma con la clase de peligro .btn-danger', () => {
    render(<App />);
    const wasteButton = screen.getByRole('button', { name: /Registrar Descarte de Merma/i });
    expect(wasteButton).toBeInTheDocument();
    expect(wasteButton).toHaveClass('btn-touch');
    expect(wasteButton).toHaveClass('btn-danger');
  });
});
