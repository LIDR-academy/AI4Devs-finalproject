import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UrgencyChip } from './UrgencyChip.js';
import { urgencyFromHours } from './urgency.js';

describe('TK-086-FE: UrgencyChip', () => {
  it('renderiza SIEMPRE marca + texto (canal redundante al color, WCAG 1.4.1)', () => {
    for (const label of ['Hoy', 'Mañana', '2 Días', '4 Días']) {
      const { container, unmount } = render(<UrgencyChip level="safe" label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      // la marca: un <span aria-hidden> hermano del texto
      expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull();
      unmount();
    }
  });

  it('aplica la clase del nivel', () => {
    const { container, rerender } = render(<UrgencyChip level="critical" label="Hoy" />);
    expect(container.firstElementChild?.className).toMatch(/chip--critical/);
    rerender(<UrgencyChip level="warning" label="Mañana" />);
    expect(container.firstElementChild?.className).toMatch(/chip--warning/);
  });

  it('urgencyFromHours cubre la escala completa sin cortarla', () => {
    expect(urgencyFromHours(3)).toEqual({ level: 'critical', label: 'Hoy' });
    expect(urgencyFromHours(30)).toEqual({ level: 'warning', label: 'Mañana' });
    expect(urgencyFromHours(48)).toEqual({ level: 'safe', label: '2 Días' });
    expect(urgencyFromHours(90)).toEqual({ level: 'safe', label: '4 Días' });
  });
});
