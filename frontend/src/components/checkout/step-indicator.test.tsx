import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StepIndicator } from './step-indicator';

describe('StepIndicator', () => {
  it('renderiza los 3 pasos con sus etiquetas', () => {
    render(<StepIndicator currentStep={1} />);
    expect(screen.getByText('Envío')).toBeInTheDocument();
    expect(screen.getByText('Pago')).toBeInTheDocument();
    expect(screen.getByText('Revisión')).toBeInTheDocument();
  });

  it('marca el paso 1 como activo cuando currentStep=1', () => {
    render(<StepIndicator currentStep={1} />);
    const steps = screen.getAllByRole('listitem');
    expect(steps[0]).toHaveAttribute('aria-current', 'step');
    expect(steps[1]).not.toHaveAttribute('aria-current');
    expect(steps[2]).not.toHaveAttribute('aria-current');
  });

  it('marca el paso 2 como activo y el paso 1 como completado cuando currentStep=2', () => {
    render(<StepIndicator currentStep={2} />);
    const steps = screen.getAllByRole('listitem');
    expect(steps[0]).not.toHaveAttribute('aria-current');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[2]).not.toHaveAttribute('aria-current');
    // Step 1 shows checkmark
    expect(steps[0].querySelector('[data-testid="step-check"]')).toBeInTheDocument();
  });

  it('marca los pasos 1 y 2 como completados y el paso 3 como activo cuando currentStep=3', () => {
    render(<StepIndicator currentStep={3} />);
    const steps = screen.getAllByRole('listitem');
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    expect(steps[0].querySelector('[data-testid="step-check"]')).toBeInTheDocument();
    expect(steps[1].querySelector('[data-testid="step-check"]')).toBeInTheDocument();
    expect(steps[2].querySelector('[data-testid="step-check"]')).not.toBeInTheDocument();
  });
});
