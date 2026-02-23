/**
 * Test suite for EmptyState component
 * T-0504-FRONT: Empty state placeholder
 * 
 * TDD-RED Phase: Tests will fail because component doesn't exist yet
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import EmptyState from './EmptyState';
import { MESSAGES } from './Dashboard3D.constants';

describe('EmptyState Component', () => {
  describe('Happy Path - Default Rendering', () => {
    it('should render empty state with default message', () => {
      render(<EmptyState />);

      expect(screen.getByText(MESSAGES.EMPTY_STATE)).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      const customMessage = 'Custom empty message';
      render(<EmptyState message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render icon (box or info)', () => {
      render(<EmptyState />);

      // Should have an SVG icon
      const container = screen.getByRole('status');
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Happy Path - Action Button', () => {
    it('should render action button when provided', () => {
      const mockAction = vi.fn();
      
      render(
        <EmptyState
          actionLabel="Cargar datos"
          onAction={mockAction}
        />
      );

      const button = screen.getByRole('button', { name: /Cargar datos/i });
      expect(button).toBeInTheDocument();
    });

    it('should call onAction when button clicked', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      
      render(
        <EmptyState
          actionLabel="Cargar datos"
          onAction={mockAction}
        />
      );

      const button = screen.getByRole('button', { name: /Cargar datos/i });
      await user.click(button);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should NOT render button when onAction is undefined', () => {
      render(<EmptyState actionLabel="Cargar datos" />);

      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases - Empty Props', () => {
    it('should use default message when message is empty string', () => {
      render(<EmptyState message="" />);

      expect(screen.getByText(MESSAGES.EMPTY_STATE)).toBeInTheDocument();
    });

    it('should use default message when message is undefined', () => {
      render(<EmptyState message={undefined} />);

      expect(screen.getByText(MESSAGES.EMPTY_STATE)).toBeInTheDocument();
    });
  });

  describe('Security - ARIA Attributes', () => {
    it('should have role="status" for screen readers', () => {
      render(<EmptyState />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<EmptyState />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });
  });
});
