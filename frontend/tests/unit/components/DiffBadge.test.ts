import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import DiffBadge from '$lib/components/DiffBadge.svelte';
import type { ListingDiff } from '$lib/api/types';

describe('DiffBadge', () => {
  it('muestra "Sin cambios" cuando unchanged es true', () => {
    const diff: ListingDiff = {
      unchanged: true,
      addedRedFlags: [],
      removedRedFlags: [],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('Sin cambios');
  });

  it('muestra delta de precio positivo en rojo', () => {
    const diff: ListingDiff = {
      unchanged: false,
      priceDelta: 5000,
      addedRedFlags: [],
      removedRedFlags: [],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('+5000');
    const badge = container.querySelector('.badge.up');
    expect(badge).toBeTruthy();
  });

  it('muestra delta de precio negativo en verde', () => {
    const diff: ListingDiff = {
      unchanged: false,
      priceDelta: -10000,
      addedRedFlags: [],
      removedRedFlags: [],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('-10.000');
    const badge = container.querySelector('.badge.down');
    expect(badge).toBeTruthy();
  });

  it('muestra banderas rojas añadidas', () => {
    const diff: ListingDiff = {
      unchanged: false,
      addedRedFlags: [{ flag: 'vague_location', severity: 'medium', reasoning: '' }],
      removedRedFlags: [],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('+1 bandera(s) roja(s)');
  });

  it('muestra banderas rojas resueltas', () => {
    const diff: ListingDiff = {
      unchanged: false,
      addedRedFlags: [],
      removedRedFlags: [
        { flag: 'vague_location', severity: 'medium', reasoning: '' },
        { flag: 'missing_energy_certificate', severity: 'medium', reasoning: '' },
      ],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('2 bandera(s) resuelta(s)');
  });

  it('muestra múltiples cambios a la vez', () => {
    const diff: ListingDiff = {
      unchanged: false,
      priceDelta: -5000,
      addedRedFlags: [{ flag: 'inflated_square_meters', severity: 'medium', reasoning: '' }],
      removedRedFlags: [],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('-5000');
    expect(container.textContent).toContain('+1 bandera(s) roja(s)');
  });
});
