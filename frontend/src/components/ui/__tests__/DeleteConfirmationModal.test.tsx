/**
 * DeleteConfirmationModal - Unit tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    isLoading: false,
  };

  it('renders modal when isOpen is true', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<DeleteConfirmationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders optional details when provided', () => {
    render(
      <DeleteConfirmationModal
        {...defaultProps}
        details="This action cannot be undone."
      />
    );
    
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    
    const confirmButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close X button is clicked', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /cerrar modal/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows loading spinner when isLoading is true', () => {
    render(<DeleteConfirmationModal {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByRole('button', { name: /eliminando/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    const closeButton = screen.getByRole('button', { name: /cerrar modal/i });
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
    expect(screen.getByTestId('delete-loading-spinner')).toBeInTheDocument();
  });

  it('does not call onConfirm when button is clicked while loading', () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onConfirm={onConfirm} isLoading={true} />);
    
    const confirmButton = screen.getByRole('button', { name: /eliminando/i });
    fireEvent.click(confirmButton);
    
    // Button is disabled, so onClick shouldn't fire
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not call onClose when Escape is pressed while loading', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} isLoading={true} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses custom button text when provided', () => {
    render(
      <DeleteConfirmationModal
        {...defaultProps}
        confirmText="Delete Forever"
        cancelText="Go Back"
      />
    );
    
    expect(screen.getByRole('button', { name: 'Delete Forever' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'delete-modal-message');
  });

  it('displays warning banner about irreversible action', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
  });

  it('calls onClose when clicking on overlay background', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />);
    
    const overlay = screen.getByTestId('delete-modal-overlay');
    fireEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />);
    
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    
    expect(onClose).not.toHaveBeenCalled();
  });
});

