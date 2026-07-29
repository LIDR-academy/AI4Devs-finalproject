import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LandingHero from '$lib/components/LandingHero.svelte';

const mockDelete = vi.fn().mockResolvedValue({ ok: true });
const mockClear = vi.fn();
const mockReset = vi.fn();

vi.mock('$lib/api/client', () => ({
  apiClient: { delete: (...args: unknown[]) => mockDelete(...args) },
}));

vi.mock('$lib/stores/lastAnalysis', () => ({
  lastAnalysis: { clear: () => mockClear() },
}));

vi.mock('$lib/stores/financialProfile', () => ({
  financialProfile: { reset: () => mockReset() },
}));

describe('LandingHero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el H1 principal', () => {
    const { container } = render(LandingHero);
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('ojos abiertos');
  });

  it('muestra el sub-hero', () => {
    const { container } = render(LandingHero);
    const sub = container.querySelector('.sub');
    expect(sub?.textContent).toContain('costes ocultos');
  });

  it('el CTA es un botón "Analizar un anuncio"', () => {
    const { container } = render(LandingHero);
    const btn = container.querySelector('button');
    expect(btn?.textContent).toContain('Analizar');
    expect(btn?.classList).toContain('cta');
  });

  it('al hacer click, borra el proceso y limpia localStorage', async () => {
    const { container } = render(LandingHero);
    const btn = container.querySelector('button') as HTMLButtonElement;
    await fireEvent.click(btn);

    expect(mockDelete).toHaveBeenCalledWith('/api/purchase-processes/active');
    expect(mockClear).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });

  it('el botón se deshabilita mientras se borra el proceso', async () => {
    const { container } = render(LandingHero);
    const btn = container.querySelector('button') as HTMLButtonElement;

    mockDelete.mockImplementationOnce(() => new Promise((r) => setTimeout(r, 100)));
    fireEvent.click(btn);

    await waitFor(() => {
      expect(btn.disabled).toBe(true);
      expect(btn.textContent).toContain('Preparando');
    });
  });
});
