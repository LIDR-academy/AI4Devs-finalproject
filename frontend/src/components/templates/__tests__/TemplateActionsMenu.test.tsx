/**
 * Unit Tests for TemplateActionsMenu Component
 *
 * Tests the actions menu component for each template row with:
 * - Download PDF action
 * - View versions action
 * - View fields action
 * - Proper icons and labels
 * - Keyboard accessibility
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TemplateActionsMenu from '../TemplateActionsMenu';

describe('TemplateActionsMenu Component', () => {
  const defaultProps = {
    templateId: 1,
    templateName: 'Test Template',
    onDownload: vi.fn(),
    onViewVersions: vi.fn(),
    onViewFields: vi.fn(),
  };

  describe('Rendering Tests', () => {
    it('renders all action buttons', () => {
      render(<TemplateActionsMenu {...defaultProps} />);

      expect(screen.getByLabelText(/download pdf/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/view version history/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/view form fields/i)).toBeInTheDocument();
    });

    it('renders icons for all buttons', () => {
      const { container } = render(<TemplateActionsMenu {...defaultProps} />);

      const icons = container.querySelectorAll('svg');
      expect(icons).toHaveLength(3);
    });
  });

  describe('Download Action Tests', () => {
    it('calls onDownload with correct template data when download button is clicked', async () => {
      const user = userEvent.setup();
      const onDownload = vi.fn();

      render(
        <TemplateActionsMenu {...defaultProps} onDownload={onDownload} />
      );

      const downloadButton = screen.getByLabelText(/download pdf/i);
      await user.click(downloadButton);

      expect(onDownload).toHaveBeenCalledWith(1, 'Test Template');
    });
  });

  describe('View Versions Action Tests', () => {
    it('calls onViewVersions with template ID when versions button is clicked', async () => {
      const user = userEvent.setup();
      const onViewVersions = vi.fn();

      render(
        <TemplateActionsMenu
          {...defaultProps}
          onViewVersions={onViewVersions}
        />
      );

      const versionsButton = screen.getByLabelText(/view version history/i);
      await user.click(versionsButton);

      expect(onViewVersions).toHaveBeenCalledWith(1);
    });
  });

  describe('View Fields Action Tests', () => {
    it('calls onViewFields with template ID when fields button is clicked', async () => {
      const user = userEvent.setup();
      const onViewFields = vi.fn();

      render(
        <TemplateActionsMenu
          {...defaultProps}
          onViewFields={onViewFields}
        />
      );

      const fieldsButton = screen.getByLabelText(/view form fields/i);
      await user.click(fieldsButton);

      expect(onViewFields).toHaveBeenCalledWith(1);
    });
  });

  describe('Accessibility Tests', () => {
    it('all buttons have proper aria-labels', () => {
      render(<TemplateActionsMenu {...defaultProps} />);

      expect(screen.getByLabelText(/download pdf/i)).toHaveAttribute(
        'aria-label',
        'Download PDF'
      );
      expect(
        screen.getByLabelText(/view version history/i)
      ).toHaveAttribute('aria-label', 'View version history');
      expect(screen.getByLabelText(/view form fields/i)).toHaveAttribute(
        'aria-label',
        'View form fields'
      );
    });

    it('all buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      const onDownload = vi.fn();

      render(
        <TemplateActionsMenu {...defaultProps} onDownload={onDownload} />
      );

      const downloadButton = screen.getByLabelText(/download pdf/i);
      downloadButton.focus();
      await user.keyboard('{Enter}');

      expect(onDownload).toHaveBeenCalled();
    });
  });

  describe('Different Template Data Tests', () => {
    it('works with different template IDs', async () => {
      const user = userEvent.setup();
      const onViewVersions = vi.fn();

      render(
        <TemplateActionsMenu
          {...defaultProps}
          templateId={42}
          onViewVersions={onViewVersions}
        />
      );

      const versionsButton = screen.getByLabelText(/view version history/i);
      await user.click(versionsButton);

      expect(onViewVersions).toHaveBeenCalledWith(42);
    });

    it('passes template name to download handler', async () => {
      const user = userEvent.setup();
      const onDownload = vi.fn();

      render(
        <TemplateActionsMenu
          {...defaultProps}
          templateName="My Custom Template"
          onDownload={onDownload}
        />
      );

      const downloadButton = screen.getByLabelText(/download pdf/i);
      await user.click(downloadButton);

      expect(onDownload).toHaveBeenCalledWith(1, 'My Custom Template');
    });
  });
});

