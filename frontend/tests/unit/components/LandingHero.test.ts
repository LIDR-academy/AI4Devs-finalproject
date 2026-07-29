import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LandingHero from '$lib/components/LandingHero.svelte';

describe('LandingHero', () => {
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
});
