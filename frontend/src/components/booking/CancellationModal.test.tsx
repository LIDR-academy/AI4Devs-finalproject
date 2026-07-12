import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CancellationModal } from './CancellationModal';

const baseProps = {
  isOpen: true,
  policy: 'Full refund if cancelled 48+ hours before check-in',
  refundAmountEur: 386,
  isCancelling: false,
  error: null as string | null,
  onConfirm: vi.fn(),
  onClose: vi.fn(),
};

describe('CancellationModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<CancellationModal {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the policy and the refund amount', () => {
    render(<CancellationModal {...baseProps} />);
    expect(screen.getByText(/Full refund if cancelled/)).toBeInTheDocument();
    expect(screen.getByText('€386.00')).toBeInTheDocument();
  });

  it('shows a no-refund message when refund is zero', () => {
    render(<CancellationModal {...baseProps} refundAmountEur={0} />);
    expect(screen.getByText(/no refund/i)).toBeInTheDocument();
  });

  it('fires onConfirm and onClose from the buttons', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<CancellationModal {...baseProps} onConfirm={onConfirm} onClose={onClose} />);
    await user.click(screen.getByTestId('confirm-cancel-button'));
    expect(onConfirm).toHaveBeenCalledOnce();
    await user.click(screen.getByTestId('dismiss-cancel-button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables the confirm button and shows progress while cancelling', () => {
    render(<CancellationModal {...baseProps} isCancelling />);
    expect(screen.getByTestId('confirm-cancel-button')).toBeDisabled();
  });

  it('styles the confirm button with the editorial terracotta token', () => {
    render(<CancellationModal {...baseProps} />);
    expect(screen.getByTestId('confirm-cancel-button').className).toContain('bg-terracotta');
  });

  it('renders an error message when provided', () => {
    render(<CancellationModal {...baseProps} error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
