import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.js';

describe('TK-001-FE: Frontend Core & Design System TDD', () => {
  beforeEach(() => {
    localStorage.setItem(
      'restostock_user_info',
      JSON.stringify({ id: 'usr-carlos-1', name: 'Carlos Gomez (Cocina)', role: 'KITCHEN_STAFF' })
    );
  });

  it('debe renderizar el encabezado principal de RestoStock', () => {
    render(<App />);
    const heading = screen.getByText(/RestoStock FEFO Dashboard/i);
    expect(heading).toBeInTheDocument();
  });

  it('debe renderizar el boton de sincronizar con la clase de ergonomia tactil .btn-touch', () => {
    render(<App />);
    const syncButton = screen.getByRole('button', { name: /Sincronizar/i });
    expect(syncButton).toBeInTheDocument();
    expect(syncButton).toHaveClass('btn-touch');
  });

  it('debe renderizar el boton de extraccion de bodega con la clase de accion principal .btn-primary', () => {
    render(<App />);
    const extractionButton = screen.getByRole('button', { name: /Extraer Insumo de Bodega/i });
    expect(extractionButton).toBeInTheDocument();
    expect(extractionButton).toHaveClass('btn-touch');
    expect(extractionButton).toHaveClass('btn-primary');
  });
});
