/**
 * Tests for VersionUploadModal component
 * 
 * Tests the modal dialog for uploading new template versions.
 * Covers template selection, form validation, submission, loading states,
 * and accessibility.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TemplateNameItem } from '../../types/templates.types';
import VersionUploadModal from './VersionUploadModal';

describe('VersionUploadModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockFetchTemplateNames = vi.fn();
  const mockFile = new File(['test'], 'test_v2.pdf', { type: 'application/pdf' });

  const mockTemplates: TemplateNameItem[] = [
    { id: 1, name: 'Solicitud Prestación Desempleo', current_version: '2024-Q1' },
    { id: 2, name: 'Certificado de Empresa', current_version: 'v1.5' },
    { id: 3, name: 'Modificación Datos Personales', current_version: '2.0' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    file: mockFile,
    isLoading: false,
    error: null,
    fetchTemplateNames: mockFetchTemplateNames,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchTemplateNames.mockResolvedValue(mockTemplates);
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<VersionUploadModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal with title when isOpen is true', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Guardar Nueva Versión')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/seleccionar plantilla/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/versión/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/resumen de cambios/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/url.*sepe/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /guardar versión/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should show filename in file info section', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      expect(screen.getByText(/test_v2\.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/archivo a subir/i)).toBeInTheDocument();
    });

    it('should render close button in header', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/cerrar modal/i);
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    it('should fetch and display template names when dropdown is opened', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      
      await waitFor(() => {
        expect(mockFetchTemplateNames).toHaveBeenCalledWith(undefined);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Solicitud Prestación Desempleo')).toBeInTheDocument();
        expect(screen.getByText('Certificado de Empresa')).toBeInTheDocument();
        expect(screen.getByText('Modificación Datos Personales')).toBeInTheDocument();
      });
    });

    it('should filter templates when search term is entered', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      await user.type(searchInput, 'Certificado');
      
      await waitFor(() => {
        expect(mockFetchTemplateNames).toHaveBeenCalledWith('Certificado');
      }, { timeout: 500 });
    });

    it('should select template when clicked', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Certificado de Empresa')).toBeInTheDocument();
      });
      
      const templateOption = screen.getByText('Certificado de Empresa');
      await user.click(templateOption);
      
      await waitFor(() => {
        expect(screen.getByText(/plantilla seleccionada/i)).toBeInTheDocument();
        expect(screen.getByText(/certificado de empresa/i)).toBeInTheDocument();
      });
    });

    it('should display loading state while fetching templates', async () => {
      mockFetchTemplateNames.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTemplates), 100))
      );
      
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      
      expect(screen.getByText(/cargando plantillas/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText(/cargando plantillas/i)).not.toBeInTheDocument();
      });
    });

    it('should display error when template fetch fails', async () => {
      mockFetchTemplateNames.mockRejectedValue(new Error('Network error'));
      
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should display message when no templates found', async () => {
      mockFetchTemplateNames.mockResolvedValue([]);
      
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText(/no se encontraron plantillas/i)).toBeInTheDocument();
      });
    });

    it('should close dropdown after template selection', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Certificado de Empresa')).toBeInTheDocument();
      });
      
      const templateOption = screen.getByText('Certificado de Empresa');
      await user.click(templateOption);
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when no template is selected', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const versionInput = screen.getByLabelText(/versión/i);
      await user.type(versionInput, '2024-Q2');
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/debe seleccionar una plantilla/i)).toBeInTheDocument();
      });
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show error when version is empty', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      // Select a template first
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      await waitFor(() => {
        expect(screen.getByText('Certificado de Empresa')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Certificado de Empresa'));
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/versión es requerida/i)).toBeInTheDocument();
      });
    });

    it('should show error when version exceeds max length', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      // Select a template
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      await waitFor(() => screen.getByText('Certificado de Empresa'));
      await user.click(screen.getByText('Certificado de Empresa'));
      
      const versionInput = screen.getByLabelText(/versión/i);
      await user.type(versionInput, 'V'.repeat(51)); // Max is 50
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/no puede exceder 50 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show error when SEPE URL is invalid', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      // Select a template
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      await waitFor(() => screen.getByText('Certificado de Empresa'));
      await user.click(screen.getByText('Certificado de Empresa'));
      
      const versionInput = screen.getByLabelText(/versión/i);
      await user.type(versionInput, '2024-Q2');
      
      const sepeUrlInput = screen.getByLabelText(/url.*sepe/i);
      await user.type(sepeUrlInput, 'not-a-valid-url');
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/url no es válida/i)).toBeInTheDocument();
      });
    });

    it('should accept valid form data', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      // Select a template
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      await waitFor(() => screen.getByText('Certificado de Empresa'));
      await user.click(screen.getByText('Certificado de Empresa'));
      
      const versionInput = screen.getByLabelText(/versión/i);
      await user.type(versionInput, '2024-Q2');
      
      const changeSummaryInput = screen.getByLabelText(/resumen de cambios/i);
      await user.type(changeSummaryInput, 'Updated fields for compliance');
      
      const sepeUrlInput = screen.getByLabelText(/url.*sepe/i);
      await user.type(sepeUrlInput, 'https://www.sepe.es/formulario-v2');
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          template_id: 2,
          version: '2024-Q2',
          change_summary: 'Updated fields for compliance',
          sepe_url: 'https://www.sepe.es/formulario-v2',
        });
      });
    });

    it('should accept empty optional fields', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      // Select a template
      const searchInput = screen.getByPlaceholderText(/buscar plantilla/i);
      await user.click(searchInput);
      await waitFor(() => screen.getByText('Certificado de Empresa'));
      await user.click(screen.getByText('Certificado de Empresa'));
      
      const versionInput = screen.getByLabelText(/versión/i);
      await user.type(versionInput, '2024-Q2');
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          template_id: 2,
          version: '2024-Q2',
          change_summary: '',
          sepe_url: '',
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form fields when loading', () => {
      render(<VersionUploadModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByPlaceholderText(/buscar plantilla/i)).toBeDisabled();
      expect(screen.getByLabelText(/versión/i)).toBeDisabled();
      expect(screen.getByLabelText(/resumen de cambios/i)).toBeDisabled();
      expect(screen.getByLabelText(/url.*sepe/i)).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      render(<VersionUploadModal {...defaultProps} isLoading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /guardando/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner when submitting', () => {
      render(<VersionUploadModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText(/guardando/i)).toBeInTheDocument();
    });

    it('should disable close button when loading', () => {
      render(<VersionUploadModal {...defaultProps} isLoading={true} />);
      
      const closeButton = screen.getByLabelText(/cerrar modal/i);
      expect(closeButton).toBeDisabled();
    });

    it('should disable submit button when no template selected', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      render(
        <VersionUploadModal
          {...defaultProps}
          error="Failed to upload version: Template not found"
        />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/failed to upload version: template not found/i)
      ).toBeInTheDocument();
    });

    it('should not display error when error is null', () => {
      render(<VersionUploadModal {...defaultProps} error={null} />);
      
      const alerts = screen.queryAllByRole('alert');
      // Should only have form validation alerts, not error message alert
      expect(alerts.length).toBe(0);
    });
  });

  describe('Modal Interaction', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/cerrar modal/i);
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when escape is pressed during loading', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} isLoading={true} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should reset form when modal is closed and reopened', async () => {
      const { rerender } = render(<VersionUploadModal {...defaultProps} />);
      
      const user = userEvent.setup();
      const versionInput = screen.getByLabelText(/versión/i);
      await user.type(versionInput, '2024-Q2');
      
      rerender(<VersionUploadModal {...defaultProps} isOpen={false} />);
      rerender(<VersionUploadModal {...defaultProps} isOpen={true} />);
      
      const newVersionInput = screen.getByLabelText(/versión/i);
      expect(newVersionInput).toHaveValue('');
    });

    it('should not close modal when clicking inside modal content', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const modalDialog = screen.getByRole('dialog');
      await user.click(modalDialog);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should mark required fields with aria-required', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      const versionInput = screen.getByLabelText(/versión/i);
      expect(versionInput).toHaveAttribute('aria-required', 'true');
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<VersionUploadModal {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /guardar versión/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const versionInput = screen.getByLabelText(/versión/i);
        expect(versionInput).toHaveAttribute('aria-invalid', 'true');
        expect(versionInput).toHaveAttribute('aria-describedby', 'version-error');
      });
    });

    it('should have proper labeling for template selector', () => {
      render(<VersionUploadModal {...defaultProps} />);
      
      const searchInput = screen.getByLabelText(/seleccionar plantilla/i);
      expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
      expect(searchInput).toHaveAttribute('aria-controls', 'template-dropdown');
    });
  });
});

