/**
 * Tests for TemplateSaveModal component
 * 
 * Tests the modal dialog for saving template analysis results with metadata.
 * Covers form validation, submission, loading states, and accessibility.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TemplateSaveModal from './TemplateSaveModal';

describe('TemplateSaveModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    file: mockFile,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<TemplateSaveModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal with title when isOpen is true', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Guardar Plantilla')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/versión/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/url.*sepe/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should show filename in description', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
      });
    });

    it('should show error when version is empty', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/nombre/i);
      await user.type(nameInput, 'Test Template');
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/versión es requerida/i)).toBeInTheDocument();
      });
    });

    it('should show error when name exceeds max length', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/nombre/i);
      await user.type(nameInput, 'A'.repeat(256)); // Max is 255
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/nombre no puede exceder 255 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show error when version exceeds max length', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/nombre/i);
      const versionInput = screen.getByLabelText(/versión/i);
      
      await user.type(nameInput, 'Test Template');
      await user.type(versionInput, '1'.repeat(51)); // Max is 50
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/versión no puede exceder 50 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid URL format', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/nombre/i);
      const versionInput = screen.getByLabelText(/versión/i);
      const urlInput = screen.getByLabelText(/url.*sepe/i);
      
      await user.type(nameInput, 'Test Template');
      await user.type(versionInput, '1.0');
      // Use paste to bypass browser's native URL validation
      await user.click(urlInput);
      await user.paste('not a valid url with spaces');
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/url no es válida/i)).toBeInTheDocument();
      });
    });

    it('should accept empty URL (optional field)', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/nombre/i);
      const versionInput = screen.getByLabelText(/versión/i);
      
      await user.type(nameInput, 'Test Template');
      await user.type(versionInput, '1.0');
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'Test Template',
          version: '1.0',
          sepe_url: '',
        });
      });
    });

    it('should accept valid URL', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/nombre/i);
      const versionInput = screen.getByLabelText(/versión/i);
      const urlInput = screen.getByLabelText(/url.*sepe/i);
      
      await user.type(nameInput, 'Test Template');
      await user.type(versionInput, '1.0');
      await user.type(urlInput, 'https://www.sepe.es/test');
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'Test Template',
          version: '1.0',
          sepe_url: 'https://www.sepe.es/test',
        });
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onSave with valid form data', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      await user.type(screen.getByLabelText(/nombre/i), 'Test Template');
      await user.type(screen.getByLabelText(/versión/i), '1.0');
      
      await user.click(screen.getByRole('button', { name: /guardar/i }));
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'Test Template',
          version: '1.0',
          sepe_url: '',
        });
      });
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button (X) is clicked', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/cerrar/i);
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside modal content', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} />);
      
      const modalContent = screen.getByRole('dialog');
      await user.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable form inputs when loading', () => {
      render(<TemplateSaveModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByLabelText(/nombre/i)).toBeDisabled();
      expect(screen.getByLabelText(/versión/i)).toBeDisabled();
      expect(screen.getByLabelText(/url.*sepe/i)).toBeDisabled();
    });

    it('should disable buttons when loading', () => {
      render(<TemplateSaveModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });

    it('should show loading spinner in submit button', () => {
      render(<TemplateSaveModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should prevent form submission when loading', async () => {
      const user = userEvent.setup();
      render(<TemplateSaveModal {...defaultProps} isLoading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /guardando/i });
      await user.click(submitButton);
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'Failed to save template';
      render(<TemplateSaveModal {...defaultProps} error={errorMessage} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error alert when error is null', () => {
      render(<TemplateSaveModal {...defaultProps} error={null} />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have proper labels for form fields', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/nombre/i);
      const versionInput = screen.getByLabelText(/versión/i);
      const urlInput = screen.getByLabelText(/url.*sepe/i);
      
      expect(nameInput).toHaveAccessibleName();
      expect(versionInput).toHaveAccessibleName();
      expect(urlInput).toHaveAccessibleName();
    });

    it('should have required indicators on required fields', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/nombre/i)).toBeRequired();
      expect(screen.getByLabelText(/versión/i)).toBeRequired();
      expect(screen.getByLabelText(/url.*sepe/i)).not.toBeRequired();
    });

    it('should trap focus within modal', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('tabIndex', '-1');
    });

    it('should have accessible close button', () => {
      render(<TemplateSaveModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/cerrar/i);
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });

  describe('Form Reset', () => {
    it('should reset form when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TemplateSaveModal {...defaultProps} />);
      
      // Fill form
      await user.type(screen.getByLabelText(/nombre/i), 'Test Template');
      await user.type(screen.getByLabelText(/versión/i), '1.0');
      
      // Close modal
      rerender(<TemplateSaveModal {...defaultProps} isOpen={false} />);
      
      // Reopen modal
      rerender(<TemplateSaveModal {...defaultProps} isOpen={true} />);
      
      // Form should be reset
      expect(screen.getByLabelText(/nombre/i)).toHaveValue('');
      expect(screen.getByLabelText(/versión/i)).toHaveValue('');
    });
  });
});

