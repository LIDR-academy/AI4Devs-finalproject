import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import RedFlagCard from '$lib/components/RedFlagCard.svelte';
import type { RedFlagItem } from '$lib/api/types';

describe('RedFlagCard', () => {
  const baseFlag: RedFlagItem = {
    flag: 'vague_location',
    severity: 'medium',
    reasoning: 'El anuncio solo menciona "zona Centro" sin calle ni barrio concreto.',
  };

  it('muestra la etiqueta en español de la red flag', () => {
    const { container } = render(RedFlagCard, { props: { flag: baseFlag } });
    expect(container.textContent).toContain('Ubicación vaga');
  });

  it('muestra la severidad', () => {
    const { container } = render(RedFlagCard, { props: { flag: baseFlag } });
    expect(container.textContent).toContain('medium');
  });

  it('muestra el reasoning del LLM', () => {
    const { container } = render(RedFlagCard, { props: { flag: baseFlag } });
    expect(container.textContent).toContain('zona Centro');
  });

  it('aplica clase high para severidad alta', () => {
    const highFlag: RedFlagItem = { ...baseFlag, severity: 'high' };
    const { container } = render(RedFlagCard, { props: { flag: highFlag } });
    const card = container.querySelector('.red-flag');
    expect(card?.classList.contains('high')).toBe(true);
  });

  it('no aplica clase high para severidad baja', () => {
    const lowFlag: RedFlagItem = { ...baseFlag, severity: 'low' };
    const { container } = render(RedFlagCard, { props: { flag: lowFlag } });
    const card = container.querySelector('.red-flag');
    expect(card?.classList.contains('high')).toBe(false);
    expect(card?.classList.contains('medium')).toBe(false);
  });

  it('usa el flag como fallback si no hay etiqueta en español', () => {
    const unknownFlag: RedFlagItem = { flag: 'unknown_type' as RedFlagItem['flag'], severity: 'low', reasoning: 'X' };
    const { container } = render(RedFlagCard, { props: { flag: unknownFlag } });
    expect(container.textContent).toContain('unknown_type');
  });
});
