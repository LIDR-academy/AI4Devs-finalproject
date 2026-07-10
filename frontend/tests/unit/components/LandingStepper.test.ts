import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LandingStepper from '$lib/components/LandingStepper.svelte';

describe('LandingStepper', () => {
  it('muestra 4 pasos con número y label', () => {
    const { container } = render(LandingStepper);
    const steps = container.querySelectorAll('[data-step-number]');
    expect(steps.length).toBe(4);
  });

  it('el paso 1 menciona Anuncio', () => {
    const { container } = render(LandingStepper);
    const step1 = container.querySelector('[data-step-number="1"]');
    expect(step1?.textContent).toMatch(/anuncio/i);
  });
});
