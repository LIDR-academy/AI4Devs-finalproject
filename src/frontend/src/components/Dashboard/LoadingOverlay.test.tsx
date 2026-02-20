/**
 * Test suite for LoadingOverlay component
 * T-0504-FRONT: Loading overlay
 * 
 * TDD-RED Phase: Tests will fail because component doesn't exist yet
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingOverlay from './LoadingOverlay';
import { MESSAGES } from './Dashboard3D.constants';

describe('LoadingOverlay Component', () => {
  describe('Happy Path - Rendering', () => {
    it('should render overlay with default message', () => {
      render(<LoadingOverlay />);

      expect(screen.getByText(MESSAGES.LOADING)).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      const customMessage = 'Cargando modelos 3D...';
      render(<LoadingOverlay message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render spinner icon', () => {
      render(<LoadingOverlay />);

      // Should have a spinner SVG
      const container = screen.getByRole('status');
      const spinner = container.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    it('should have semi-transparent background', () => {
      render(<LoadingOverlay />);

      const container = screen.getByRole('status');
      // Check for overlay styling (e.g., backdrop)
      expect(container).toHaveStyle({
        backgroundColor: expect.stringContaining('rgba'),
      });
    });
  });

  describe('Edge Cases - Empty Message', () => {
    it('should use default message when message is undefined', () => {
      render(<LoadingOverlay message={undefined} />);

      expect(screen.getByText(MESSAGES.LOADING)).toBeInTheDocument();
    });

    it('should use default message when message is empty string', () => {
      render(<LoadingOverlay message="" />);

      expect(screen.getByText(MESSAGES.LOADING)).toBeInTheDocument();
    });
  });

  describe('Security - ARIA Attributes', () => {
    it('should have role="status" for screen readers', () => {
      render(<LoadingOverlay />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<LoadingOverlay />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-busy="true"', () => {
      render(<LoadingOverlay />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-busy', 'true');
    });
  });
});
