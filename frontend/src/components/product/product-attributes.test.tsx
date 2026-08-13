import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductAttributes } from './product-attributes';

const base = {
  level: [] as string[],
  distance: [] as string[],
  surface: [] as string[],
  objective: [] as string[],
};

describe('ProductAttributes — level badges', () => {
  it('renders "Principiante" badge with bg-rm-level-beginner-bg class', () => {
    render(<ProductAttributes product={{ ...base, level: ['beginner'] }} />);

    const badge = screen.getByText('Principiante');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-rm-level-beginner-bg');
  });

  it('renders "Popular" badge with bg-rm-level-intermediate-bg class', () => {
    render(<ProductAttributes product={{ ...base, level: ['intermediate'] }} />);

    const badge = screen.getByText('Popular');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-rm-level-intermediate-bg');
  });

  it('renders "Avanzado" badge with bg-rm-level-advanced-bg class', () => {
    render(<ProductAttributes product={{ ...base, level: ['advanced'] }} />);

    const badge = screen.getByText('Avanzado');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-rm-level-advanced-bg');
  });

  it('renders nothing when level array is empty', () => {
    const { container } = render(<ProductAttributes product={{ ...base, level: [] }} />);
    expect(container.querySelectorAll('[data-testid]')).toHaveLength(0);
  });
});

describe('ProductAttributes — distance badges', () => {
  it('renders "Maratón" badge for distance marathon', () => {
    render(<ProductAttributes product={{ ...base, distance: ['marathon'] }} />);

    expect(screen.getByText('Maratón')).toBeInTheDocument();
  });

  it('renders "Ultra" badge for distance ultra', () => {
    render(<ProductAttributes product={{ ...base, distance: ['ultra'] }} />);

    expect(screen.getByText('Ultra')).toBeInTheDocument();
  });

  it('renders multiple distance badges when array has several values', () => {
    render(<ProductAttributes product={{ ...base, distance: ['marathon', 'ultra'] }} />);

    expect(screen.getByText('Maratón')).toBeInTheDocument();
    expect(screen.getByText('Ultra')).toBeInTheDocument();
  });

  it('renders "Media Maratón" badge for half-marathon', () => {
    render(<ProductAttributes product={{ ...base, distance: ['half-marathon'] }} />);

    expect(screen.getByText('Media Maratón')).toBeInTheDocument();
  });
});

describe('ProductAttributes — surface badges', () => {
  it('renders "Trail" badge for surface trail', () => {
    render(<ProductAttributes product={{ ...base, surface: ['trail'] }} />);

    expect(screen.getByText('Trail')).toBeInTheDocument();
  });

  it('renders "Asfalto" badge for surface road', () => {
    render(<ProductAttributes product={{ ...base, surface: ['road'] }} />);

    expect(screen.getByText('Asfalto')).toBeInTheDocument();
  });
});

describe('ProductAttributes — objective badges', () => {
  it('renders "Competición" badge for objective competition', () => {
    render(<ProductAttributes product={{ ...base, objective: ['competition'] }} />);

    expect(screen.getByText('Competición')).toBeInTheDocument();
  });

  it('renders "Entrenamiento" badge for objective training', () => {
    render(<ProductAttributes product={{ ...base, objective: ['training'] }} />);

    expect(screen.getByText('Entrenamiento')).toBeInTheDocument();
  });
});
