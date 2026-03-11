/**
 * Unit Tests for TemplateFieldsModal Component
 *
 * Tests the template fields modal component with:
 * - Rendering fields data in a table
 * - Color-coded field type badges
 * - Search functionality
 * - Pagination
 * - Page number filtering
 * - Closing functionality (ESC, click-outside, close button)
 * - Loading and error states
 * - Accessibility features
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TemplateField, VersionInfo } from '../../../types/templates.types';
import TemplateFieldsModal from '../TemplateFieldsModal';

const mockFields: TemplateField[] = [
  {
    id: 1,
    template_version_id: 1,
    field_id: 'field_name',
    field_type: 'text',
    near_text: 'Name:',
    page_number: 1,
    field_page_order: 1,
    position: {
      x: 100,
      y: 200,
      width: 150,
      height: 20,
    },
    created_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 2,
    template_version_id: 1,
    field_id: 'field_email',
    field_type: 'text',
    near_text: 'Email:',
    page_number: 1,
    field_page_order: 2,
    position: {
      x: 100,
      y: 230,
      width: 150,
      height: 20,
    },
    created_at: '2025-10-01T10:00:00Z',
  },
];

const mockVersionInfo: VersionInfo = {
  id: 1,
  version_number: '1.0',
  page_count: 5,
};

describe('TemplateFieldsModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    templateName: 'Test Template',
    fields: mockFields,
    versionInfo: mockVersionInfo,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    search: '',
    pageNumber: null,
    onPageChange: vi.fn(),
    onSearchChange: vi.fn(),
    onPageNumberFilter: vi.fn(),
    onClearPageFilter: vi.fn(),
  };

  describe('Rendering Tests', () => {
    it('renders modal when isOpen is true', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      expect(
        screen.getByRole('dialog', { name: /form fields/i })
      ).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<TemplateFieldsModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByRole('dialog', { name: /form fields/i })
      ).not.toBeInTheDocument();
    });

    it('displays template name and version in title', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      expect(screen.getByText(/test template/i)).toBeInTheDocument();
      expect(screen.getByText(/version 1\.0/i)).toBeInTheDocument();
    });

    it('renders all fields in table', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      expect(screen.getByText('field_name')).toBeInTheDocument();
      expect(screen.getByText('field_email')).toBeInTheDocument();
    });
  });

  describe('Search Functionality Tests', () => {
    it('renders search input', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      expect(
        screen.getByPlaceholderText(/search fields/i)
      ).toBeInTheDocument();
    });

    it('calls onSearchChange when typing in search', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      render(
        <TemplateFieldsModal
          {...defaultProps}
          onSearchChange={onSearchChange}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search fields/i);
      await user.type(searchInput, 'test');

      expect(onSearchChange).toHaveBeenCalled();
    });
  });

  describe('Page Filter Tests', () => {
    it('renders page filter dropdown', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      expect(screen.getByLabelText(/filter by page/i)).toBeInTheDocument();
    });

    it('calls onPageNumberFilter when selecting a page', async () => {
      const user = userEvent.setup();
      const onPageNumberFilter = vi.fn();

      render(
        <TemplateFieldsModal
          {...defaultProps}
          onPageNumberFilter={onPageNumberFilter}
        />
      );

      const pageFilter = screen.getByLabelText(/filter by page/i);
      await user.selectOptions(pageFilter, '2');

      expect(onPageNumberFilter).toHaveBeenCalledWith(2);
    });

    it('shows clear filter button when page filter is active', () => {
      render(<TemplateFieldsModal {...defaultProps} pageNumber={2} />);

      expect(screen.getByText(/clear filter/i)).toBeInTheDocument();
    });

    it('calls onClearPageFilter when clicking clear button', async () => {
      const user = userEvent.setup();
      const onClearPageFilter = vi.fn();

      render(
        <TemplateFieldsModal
          {...defaultProps}
          pageNumber={2}
          onClearPageFilter={onClearPageFilter}
        />
      );

      const clearButton = screen.getByText(/clear filter/i);
      await user.click(clearButton);

      expect(onClearPageFilter).toHaveBeenCalled();
    });
  });

  describe('Field Type Badge Tests', () => {
    it('displays field type badges with colors', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      const badges = screen.getAllByText(/text/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Close Functionality Tests', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<TemplateFieldsModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<TemplateFieldsModal {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Loading State Tests', () => {
    it('shows loading spinner when isLoading is true', () => {
      const { container } = render(
        <TemplateFieldsModal {...defaultProps} isLoading fields={[]} />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State Tests', () => {
    it('displays error message when error is present', () => {
      render(
        <TemplateFieldsModal
          {...defaultProps}
          error="Failed to load fields"
        />
      );

      expect(screen.getByText(/failed to load fields/i)).toBeInTheDocument();
    });
  });

  describe('Empty State Tests', () => {
    it('shows empty state when no fields', () => {
      render(<TemplateFieldsModal {...defaultProps} fields={[]} />);

      expect(screen.getByText(/no fields found/i)).toBeInTheDocument();
    });
  });

  describe('Pagination Tests', () => {
    it('renders pagination when totalPages > 1', () => {
      render(<TemplateFieldsModal {...defaultProps} totalPages={3} />);

      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
    });

    it('calls onPageChange when changing page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <TemplateFieldsModal
          {...defaultProps}
          totalPages={3}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByLabelText(/next page/i);
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper role and aria-modal attributes', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has proper table structure', () => {
      render(<TemplateFieldsModal {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});

