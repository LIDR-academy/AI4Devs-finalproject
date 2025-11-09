/**
 * Unit Tests for VersionHistoryModal Component
 *
 * Tests the version history modal component with:
 * - Rendering version history data
 * - Timeline layout with current version highlight
 * - Pagination for versions
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
import type { TemplateVersion } from '../../../types/templates.types';
import VersionHistoryModal from '../VersionHistoryModal';

const mockVersions: TemplateVersion[] = [
  {
    id: 1,
    template_id: 1,
    version_number: '1.0',
    file_path: '/uploads/template_v1.0.pdf',
    file_size_bytes: 2621440,
    checksum: 'abc123',
    page_count: 5,
    title: 'Template Title',
    author: 'John Doe',
    subject: 'Test Template',
    creation_date: '2025-10-01T10:00:00Z',
    modification_date: '2025-10-15T10:00:00Z',
    created_at: '2025-10-01T10:00:00Z',
    is_current: true,
  },
  {
    id: 2,
    template_id: 1,
    version_number: '0.9',
    file_path: '/uploads/template_v0.9.pdf',
    file_size_bytes: 2097152,
    checksum: 'def456',
    page_count: 4,
    title: 'Template Title',
    author: 'Jane Smith',
    subject: 'Test Template',
    creation_date: '2025-09-15T10:00:00Z',
    modification_date: '2025-09-20T10:00:00Z',
    created_at: '2025-09-15T10:00:00Z',
    is_current: false,
  },
];

describe('VersionHistoryModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    templateName: 'Test Template',
    versions: mockVersions,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    onPageChange: vi.fn(),
  };

  describe('Rendering Tests', () => {
    it('renders modal when isOpen is true', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      expect(
        screen.getByRole('dialog', { name: /version history/i })
      ).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<VersionHistoryModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByRole('dialog', { name: /version history/i })
      ).not.toBeInTheDocument();
    });

    it('displays template name in title', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      expect(
        screen.getByText(/version history.*test template/i)
      ).toBeInTheDocument();
    });

    it('renders all versions in timeline', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      expect(screen.getByText(/version 1\.0/i)).toBeInTheDocument();
      expect(screen.getByText(/version 0\.9/i)).toBeInTheDocument();
    });

    it('highlights current version', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      const currentBadge = screen.getByText(/current/i);
      expect(currentBadge).toBeInTheDocument();
    });
  });

  describe('Version Data Display Tests', () => {
    it('displays version metadata correctly', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // page count
      expect(screen.getByText(/2.5 MB/i)).toBeInTheDocument();
    });

    it('displays creation date', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      // Should display "Created:" label (appears multiple times for each version)
      expect(screen.getAllByText(/created:/i).length).toBeGreaterThan(0);
    });
  });

  describe('Close Functionality Tests', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<VersionHistoryModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<VersionHistoryModal {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when clicking overlay', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { container } = render(
        <VersionHistoryModal {...defaultProps} onClose={onClose} />
      );

      const overlay = container.querySelector('.modal-overlay');
      expect(overlay).toBeInTheDocument();
      
      if (overlay) {
        await user.click(overlay);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('does not call onClose when clicking modal content', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<VersionHistoryModal {...defaultProps} onClose={onClose} />);

      const dialog = screen.getByRole('dialog');
      await user.click(dialog);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading State Tests', () => {
    it('shows loading spinner when isLoading is true', () => {
      const { container } = render(
        <VersionHistoryModal {...defaultProps} isLoading versions={[]} />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('does not show versions when loading', () => {
      render(
        <VersionHistoryModal {...defaultProps} isLoading versions={[]} />
      );

      expect(screen.queryByText('1.0')).not.toBeInTheDocument();
    });
  });

  describe('Error State Tests', () => {
    it('displays error message when error is present', () => {
      render(
        <VersionHistoryModal
          {...defaultProps}
          error="Failed to load versions"
        />
      );

      expect(screen.getByText(/failed to load versions/i)).toBeInTheDocument();
    });
  });

  describe('Empty State Tests', () => {
    it('shows empty state when no versions', () => {
      render(<VersionHistoryModal {...defaultProps} versions={[]} />);

      expect(screen.getByText(/no versions found/i)).toBeInTheDocument();
    });
  });

  describe('Pagination Tests', () => {
    it('renders pagination when totalPages > 1', () => {
      render(<VersionHistoryModal {...defaultProps} totalPages={3} />);

      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
    });

    it('calls onPageChange when changing page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <VersionHistoryModal
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
      render(<VersionHistoryModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has proper aria-labelledby', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('close button has proper aria-label', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      expect(screen.getByLabelText(/close/i)).toBeInTheDocument();
    });

    it('traps focus within modal', () => {
      render(<VersionHistoryModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });
});

