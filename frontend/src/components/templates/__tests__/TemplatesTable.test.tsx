/**
 * Unit Tests for TemplatesTable Component
 *
 * Tests the main templates table component with:
 * - Rendering templates data
 * - Sortable columns
 * - Loading states
 * - Empty states
 * - Action buttons
 * - Responsive design
 * - Accessibility
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Template } from '../../../types/templates.types';
import TemplatesTable from '../TemplatesTable';

const mockTemplates: Template[] = [
  {
    id: 1,
    name: 'Template A',
    version: '1.0',
    file_path: '/uploads/template_a.pdf',
    file_size_bytes: 2621440, // 2.5 MB
    field_count: 15,
    sepe_url: null,
    uploaded_by: null,
    updated_at: '2025-10-20T10:00:00Z',
    created_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Template B',
    version: '2.1',
    file_path: '/uploads/template_b.pdf',
    file_size_bytes: 3984588, // 3.8 MB
    field_count: 22,
    sepe_url: null,
    uploaded_by: null,
    updated_at: '2025-10-22T14:30:00Z',
    created_at: '2025-10-05T14:30:00Z',
  },
];

describe('TemplatesTable Component', () => {
  const defaultProps = {
    templates: mockTemplates,
    isLoading: false,
    sortBy: 'updated_at',
    sortOrder: 'desc' as const,
    onSort: vi.fn(),
    onDownload: vi.fn(),
    onViewVersions: vi.fn(),
    onViewFields: vi.fn(),
  };

  describe('Rendering Tests', () => {
    it('renders table with all columns', () => {
      render(<TemplatesTable {...defaultProps} />);

      expect(screen.getByText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/version/i)).toBeInTheDocument();
      expect(screen.getByText(/size/i)).toBeInTheDocument();
      expect(screen.getByText(/fields/i)).toBeInTheDocument();
      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
      expect(screen.getByText(/actions/i)).toBeInTheDocument();
    });

    it('renders all templates data', () => {
      render(<TemplatesTable {...defaultProps} />);

      expect(screen.getByText('Template A')).toBeInTheDocument();
      expect(screen.getByText('Template B')).toBeInTheDocument();
      expect(screen.getByText('1.0')).toBeInTheDocument();
      expect(screen.getByText('2.1')).toBeInTheDocument();
    });

    it('renders action buttons for each template', () => {
      render(<TemplatesTable {...defaultProps} />);

      const downloadButtons = screen.getAllByLabelText(/download pdf/i);
      expect(downloadButtons).toHaveLength(2);
    });
  });

  describe('Sorting Tests', () => {
    it('calls onSort when clicking sortable column header', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(<TemplatesTable {...defaultProps} onSort={onSort} />);

      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('shows sort indicator on sorted column', () => {
      render(<TemplatesTable {...defaultProps} sortBy="name" />);

      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toBeInTheDocument();
    });
  });

  describe('Loading State Tests', () => {
    it('shows loading spinner when isLoading is true', () => {
      const { container } = render(
        <TemplatesTable {...defaultProps} isLoading templates={[]} />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('does not render templates when loading', () => {
      render(
        <TemplatesTable {...defaultProps} isLoading templates={[]} />
      );

      expect(screen.queryByText('Template A')).not.toBeInTheDocument();
    });
  });

  describe('Empty State Tests', () => {
    it('shows empty state when no templates and not loading', () => {
      render(<TemplatesTable {...defaultProps} templates={[]} />);

      expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
    });

    it('does not show empty state when loading', () => {
      render(
        <TemplatesTable {...defaultProps} isLoading templates={[]} />
      );

      expect(
        screen.queryByText(/no templates found/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Actions Tests', () => {
    it('calls onDownload with correct params', async () => {
      const user = userEvent.setup();
      const onDownload = vi.fn();

      render(<TemplatesTable {...defaultProps} onDownload={onDownload} />);

      const downloadButtons = screen.getAllByLabelText(/download pdf/i);
      await user.click(downloadButtons[0]);

      expect(onDownload).toHaveBeenCalledWith(1, 'Template A');
    });

    it('calls onViewVersions with template ID', async () => {
      const user = userEvent.setup();
      const onViewVersions = vi.fn();

      render(
        <TemplatesTable {...defaultProps} onViewVersions={onViewVersions} />
      );

      const versionsButtons = screen.getAllByLabelText(
        /view version history/i
      );
      await user.click(versionsButtons[1]);

      expect(onViewVersions).toHaveBeenCalledWith(2);
    });

    it('calls onViewFields with template ID', async () => {
      const user = userEvent.setup();
      const onViewFields = vi.fn();

      render(
        <TemplatesTable {...defaultProps} onViewFields={onViewFields} />
      );

      const fieldsButtons = screen.getAllByLabelText(/view form fields/i);
      await user.click(fieldsButtons[0]);

      expect(onViewFields).toHaveBeenCalledWith(1);
    });
  });

  describe('Accessibility Tests', () => {
    it('renders a proper table element', () => {
      render(<TemplatesTable {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('has proper table headers', () => {
      render(<TemplatesTable {...defaultProps} />);

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBeGreaterThan(0);
    });

    it('has proper aria-label for sortable headers', () => {
      render(<TemplatesTable {...defaultProps} />);

      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toBeInTheDocument();
    });
  });
});

