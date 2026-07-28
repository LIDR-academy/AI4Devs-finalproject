import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProcessStepper from '$lib/components/ProcessStepper.svelte';

describe('ProcessStepper', () => {
  const steps = [
    { id: 'listing', label: 'Anuncio', href: '/listing-lens' },
    { id: 'mortgage', label: 'Hipoteca', href: '/mortgage-compass' },
    { id: 'timeline', label: 'Cronograma', href: '/timeline' },
  ];

  it('renderiza 3 pasos', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'listing', completedSteps: new Set<string>() },
    });
    const items = container.querySelectorAll('[data-step-id]');
    expect(items.length).toBe(3);
  });

  it('marca el paso actual con la clase "current"', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set<string>() },
    });
    const current = container.querySelector('[data-step-id="mortgage"]');
    expect(current?.className).toContain('current');
  });

  it('marca los completados con la clase "completed"', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set(['listing']) },
    });
    const completed = container.querySelector('[data-step-id="listing"]');
    expect(completed?.className).toContain('completed');
  });

  it('los pasos completados tienen un link', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set<string>(['listing']) },
    });
    const completedLink = container.querySelector('[data-step-id="listing"] a');
    expect(completedLink?.getAttribute('href')).toBe('/listing-lens');
  });

  it('el paso actual NO tiene link (no-op al click)', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set<string>() },
    });
    const currentLink = container.querySelector('[data-step-id="mortgage"] a');
    expect(currentLink).toBeNull();
  });
});
