import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App.js';
import { AuthService } from '../features/auth/services/auth.service.js';

const THEME_STORAGE_KEY = 'fefo-theme';

function stubMatchMediaPrefersDark(prefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark') ? prefersDark : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

describe('TK-081-FE: Interruptor Sistema FEFO (turno Dia/Noche, US-022)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    AuthService.saveSession('test-token-jwt-12345', {
      id: 'usr-1',
      name: 'Chef Operario',
      role: 'KITCHEN_STAFF',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
  });

  it('debe iniciar en modo Dia por defecto cuando no hay preferencia guardada ni preferencia oscura del sistema', () => {
    stubMatchMediaPrefersDark(false);

    render(<App />);

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Día' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Noche' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('debe cambiar a modo Noche al tocar el interruptor, aplicando data-theme="dark" en <html> y persistiendolo (US-022 Escenario 1)', () => {
    stubMatchMediaPrefersDark(false);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Noche' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Noche' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Día' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('debe respetar una preferencia guardada en localStorage al montar, sin importar la preferencia del sistema', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    stubMatchMediaPrefersDark(false);

    render(<App />);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Noche' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('sin preferencia guardada, debe caer en prefers-color-scheme del sistema operativo (US-022 Escenario 2)', () => {
    stubMatchMediaPrefersDark(true);

    render(<App />);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Noche' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('debe volver a modo Dia al tocar el interruptor Dia desde modo Noche', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    stubMatchMediaPrefersDark(false);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Día' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
