/**
 * Unit Tests for EmptyState Component
 *
 * Tests the empty state component for templates list when:
 * - No templates exist in the system
 * - Search/filter returns no results
 * - Different empty state scenarios
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from '../EmptyState';

describe('EmptyState Component', () => {
  describe('Rendering Tests', () => {
    it('renders default empty state with all elements', () => {
      render(<EmptyState />);

      expect(
        screen.getByRole('heading', { name: /no templates found/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/no templates have been uploaded yet/i)
      ).toBeInTheDocument();
    });

    it('renders custom title when provided', () => {
      render(<EmptyState title="Custom Title" />);

      expect(
        screen.getByRole('heading', { name: /custom title/i })
      ).toBeInTheDocument();
    });

    it('renders custom description when provided', () => {
      render(<EmptyState description="Custom description text" />);

      expect(
        screen.getByText(/custom description text/i)
      ).toBeInTheDocument();
    });

    it('renders icon when showIcon is true', () => {
      const { container } = render(<EmptyState showIcon />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('does not render icon when showIcon is false', () => {
      const { container } = render(<EmptyState showIcon={false} />);

      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Empty State Variants', () => {
    it('renders "no results" variant for search/filter', () => {
      render(
        <EmptyState
          title="No matching templates"
          description="Try adjusting your search or filters"
        />
      );

      expect(
        screen.getByRole('heading', { name: /no matching templates/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/try adjusting your search or filters/i)
      ).toBeInTheDocument();
    });

    it('renders "no templates" variant for empty system', () => {
      render(
        <EmptyState
          title="No templates found"
          description="No templates have been uploaded yet. Upload your first PDF template to get started."
        />
      );

      expect(
        screen.getByRole('heading', { name: /no templates found/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/upload your first pdf template/i)
      ).toBeInTheDocument();
    });
  });

  describe('Action Button Tests', () => {
    it('renders action button when provided', () => {
      const action = {
        label: 'Upload Template',
        onClick: () => {},
      };

      render(<EmptyState action={action} />);

      const button = screen.getByRole('button', { name: /upload template/i });
      expect(button).toBeInTheDocument();
    });

    it('does not render action button when not provided', () => {
      render(<EmptyState />);

      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper heading hierarchy', () => {
      render(<EmptyState />);

      const heading = screen.getByRole('heading', {
        name: /no templates found/i,
      });
      expect(heading.tagName).toBe('H2');
    });

    it('has descriptive text for screen readers', () => {
      render(<EmptyState description="This is a description" />);

      const description = screen.getByText(/this is a description/i);
      expect(description).toBeInTheDocument();
    });

    it('icon has proper aria attributes when present', () => {
      const { container } = render(<EmptyState showIcon />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Styling Tests', () => {
    it('applies correct container classes', () => {
      const { container } = render(<EmptyState />);

      const emptyStateDiv = container.querySelector('.empty-state');
      expect(emptyStateDiv).toHaveClass('empty-state');
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <EmptyState className="custom-class" />
      );

      const emptyStateDiv = container.firstChild;
      expect(emptyStateDiv).toHaveClass('custom-class');
    });
  });
});

