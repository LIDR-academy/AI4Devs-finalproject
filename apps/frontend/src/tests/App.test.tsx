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

  it('debe renderizar el boton de accion circular de extraccion (Sistema FEFO, TK-086-FE)', () => {
    render(<App />);
    // El ActionButton circular reemplaza al antiguo btn-primary rectangular (US-023 lámina "Aplicación").
    const extractionButton = screen.getByRole('button', { name: /Extraer de Bodega/i });
    expect(extractionButton).toBeInTheDocument();
    expect(extractionButton).toHaveAttribute('type', 'button');
    expect(extractionButton.className).toMatch(/circle--extract/);
  });
});
