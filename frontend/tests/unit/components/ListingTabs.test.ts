import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ListingTabs from '$lib/components/ListingTabs.svelte';

describe('ListingTabs', () => {
  it('muestra ambas tabs (URL y Texto)', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalize: vi.fn() },
    });
    expect(container.textContent).toContain('URL');
    expect(container.textContent).toContain('Texto');
  });

  it('la tab URL está activa por defecto', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalize: vi.fn() },
    });
    const urlField = container.querySelector('input[type="url"]');
    expect(urlField).toBeTruthy();
  });

  it('cambia a tab Texto al hacer click', async () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalize: vi.fn() },
    });
    const textTab = container.querySelector('[data-tab="text"]');
    if (textTab) await fireEvent.click(textTab);
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('marca la tab URL como tachada cuando urlBlocked=true', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: true, onAnalize: vi.fn() },
    });
    const urlTab = container.querySelector('[data-tab="url"]');
    expect(urlTab?.className).toContain('blocked');
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });
});
