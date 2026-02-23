/**
 * T-0506-FRONT: CheckboxGroup Component Tests
 * 
 * TDD RED Phase: Tests for reusable multi-select checkbox UI
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckboxGroup from './CheckboxGroup';

describe('CheckboxGroup', () => {
  const mockOptions = [
    { value: 'capitel', label: 'Capitel' },
    { value: 'columna', label: 'Columna' },
    { value: 'dovela', label: 'Dovela' },
  ];

  it('should render all checkbox options', () => {
    render(
      <CheckboxGroup
        options={mockOptions}
        value={[]}
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Capitel')).toBeInTheDocument();
    expect(screen.getByLabelText('Columna')).toBeInTheDocument();
    expect(screen.getByLabelText('Dovela')).toBeInTheDocument();
  });

  it('should mark selected values as checked', () => {
    render(
      <CheckboxGroup
        options={mockOptions}
        value={['capitel', 'columna']}
        onChange={() => {}}
      />
    );

    const capitelCheckbox = screen.getByLabelText('Capitel') as HTMLInputElement;
    const columnaCheckbox = screen.getByLabelText('Columna') as HTMLInputElement;
    const dovelaCheckbox = screen.getByLabelText('Dovela') as HTMLInputElement;

    expect(capitelCheckbox.checked).toBe(true);
    expect(columnaCheckbox.checked).toBe(true);
    expect(dovelaCheckbox.checked).toBe(false);
  });

  it('should call onChange with added value when unchecked box is clicked', () => {
    const handleChange = vi.fn();
    
    render(
      <CheckboxGroup
        options={mockOptions}
        value={['capitel']}
        onChange={handleChange}
      />
    );

    const columnaCheckbox = screen.getByLabelText('Columna');
    fireEvent.click(columnaCheckbox);

    expect(handleChange).toHaveBeenCalledWith(['capitel', 'columna']);
  });

  it('should call onChange with removed value when checked box is clicked', () => {
    const handleChange = vi.fn();
    
    render(
      <CheckboxGroup
        options={mockOptions}
        value={['capitel', 'columna']}
        onChange={handleChange}
      />
    );

    const capitelCheckbox = screen.getByLabelText('Capitel');
    fireEvent.click(capitelCheckbox);

    expect(handleChange).toHaveBeenCalledWith(['columna']);
  });

  it('should render color badge when option has color', () => {
    const optionsWithColor = [
      { value: 'validated', label: 'Validado', color: '#10b981' },
    ];

    render(
      <CheckboxGroup
        options={optionsWithColor}
        value={[]}
        onChange={() => {}}
      />
    );

    const colorBadge = screen.getByTestId('color-badge-validated');
    expect(colorBadge).toBeInTheDocument();
    expect(colorBadge).toHaveStyle({ backgroundColor: '#10b981' });
  });

  it('should apply custom aria-label if provided', () => {
    const { container } = render(
      <CheckboxGroup
        options={mockOptions}
        value={[]}
        onChange={() => {}}
        ariaLabel="Filtro de tipología"
      />
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toHaveAttribute('aria-label', 'Filtro de tipología');
  });
});
