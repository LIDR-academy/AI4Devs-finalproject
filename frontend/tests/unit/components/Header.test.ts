import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Header from '$lib/components/Header.svelte';
import HeaderWithContent from './Header.test-wrapper.svelte';

describe('Header', () => {
  it('renderiza el Logo', () => {
    const { container } = render(Header);
    const link = container.querySelector('a[aria-label*="Realista"]');
    expect(link).toBeTruthy();
  });

  it('tiene position sticky computado', () => {
    const { container } = render(Header);
    const header = container.querySelector('header');
    const styles = window.getComputedStyle(header as Element);
    expect(styles.position).toBe('sticky');
  });

  it('el inner div es flex con gap y right-slot auto-margin', () => {
    const { container } = render(Header);
    const inner = container.querySelector('.inner');
    const styles = window.getComputedStyle(inner as Element);
    expect(styles.display).toBe('flex');
    expect(styles.alignItems).toBe('center');
    expect(styles.gap).toBe('0.5rem');
  });

  it('el header tiene un border-bottom', () => {
    const { container } = render(Header);
    const header = container.querySelector('header');
    const styles = window.getComputedStyle(header as Element);
    expect(styles.borderBottomWidth).not.toBe('0px');
  });

  it('renderiza children en el slot derecho', () => {
    const { container } = render(HeaderWithContent);
    const slot = container.querySelector('.right-slot button');
    expect(slot?.textContent?.trim()).toBe('Test');
  });
});
