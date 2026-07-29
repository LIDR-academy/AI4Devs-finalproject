import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ListingTabs from '$lib/components/ListingTabs.svelte';

describe('ListingTabs', () => {
  it('muestra ambas tabs (Texto y URL)', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalyze: vi.fn() },
    });
    expect(container.textContent).toContain('URL');
    expect(container.textContent).toContain('Texto');
  });

  it('la tab Texto está activa por defecto', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalyze: vi.fn() },
    });
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('cambia a tab URL al hacer click', async () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalyze: vi.fn() },
    });
    const urlTab = container.querySelector('[data-tab="url"]');
    if (urlTab) await fireEvent.click(urlTab);
    const urlField = container.querySelector('input[type="url"]');
    expect(urlField).toBeTruthy();
  });

  it('marca la tab URL como tachada cuando urlBlocked=true', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: true, onAnalyze: vi.fn() },
    });
    const urlTab = container.querySelector('[data-tab="url"]');
    expect(urlTab?.className).toContain('blocked');
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });
});
