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
      addedRedFlags: [{ category: 'vague_location', question: '', rationale: '' }],
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
        { category: 'vague_location', question: '', rationale: '' },
        { category: 'missing_energy_certificate', question: '', rationale: '' },
      ],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('2 bandera(s) resuelta(s)');
  });

  it('muestra múltiples cambios a la vez', () => {
    const diff: ListingDiff = {
      unchanged: false,
      priceDelta: -5000,
      addedRedFlags: [{ category: 'inflated_square_meters', question: '', rationale: '' }],
      removedRedFlags: [],
    };
    const { container } = render(DiffBadge, { props: { diff } });
    expect(container.textContent).toContain('-5000');
    expect(container.textContent).toContain('+1 bandera(s) roja(s)');
  });
});
