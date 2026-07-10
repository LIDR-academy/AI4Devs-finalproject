import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Logo from '$lib/components/Logo.svelte';

describe('Logo', () => {
  it('renderiza el SVG con la casa-prisma arcoíris', () => {
    const { container } = render(Logo);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    const lines = container.querySelectorAll('line[stroke]');
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });

  it('muestra el wordmark "Realista" en variant "full"', () => {
    const { container } = render(Logo, { props: { variant: 'full' } });
    const wordmark = container.querySelector('span');
    expect(wordmark?.textContent?.trim()).toBe('Realista');
  });

  it('oculta el wordmark en variant "icon"', () => {
    const { container } = render(Logo, { props: { variant: 'icon' } });
    const wordmark = container.querySelector('span.wordmark');
    expect(wordmark).toBeNull();
  });
});
