import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeatSelectionModal } from './SeatSelectionModal';

// Mock de useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'match.selectSeats': 'Select Seats',
        'match.availableSeats': `Available seats: ${params?.seats || 0}`,
        'match.selectSeatsDescription': 'Choose how many seats you want to book',
        'match.selectedSeats': 'Selected seats',
        'match.seat': 'seat',
        'match.seats': 'seats',
        'match.confirmBooking': 'Confirm Booking',
        'common:cancel': 'Cancel'
      };
      return translations[key] || key;
    }
  })
}));

describe('SeatSelectionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    maxSeats: 4,
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<SeatSelectionModal {...defaultProps} />);
      
      expect(screen.getByText('Select Seats')).toBeInTheDocument();
      expect(screen.getByText('Available seats: 4')).toBeInTheDocument();
      expect(screen.getByText('Choose how many seats you want to book')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<SeatSelectionModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Select Seats')).not.toBeInTheDocument();
    });

    it('should render seat selection buttons for each available seat', () => {
      render(<SeatSelectionModal {...defaultProps} maxSeats={3} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.queryByText('4')).not.toBeInTheDocument();
    });

    it('should show selection summary', () => {
      render(<SeatSelectionModal {...defaultProps} />);
      
      expect(screen.getByText('Selected seats')).toBeInTheDocument();
      expect(screen.getByText('1 seat')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should select seat when button is clicked', async () => {
      const user = userEvent.setup();
      render(<SeatSelectionModal {...defaultProps} />);
      
      const seatButton = screen.getByText('3');
      await user.click(seatButton);
      
      expect(seatButton).toHaveClass('bg-primary-600'); // Primary variant
      // Check that the summary shows the selected seats
      expect(screen.getByText('3 seats')).toBeInTheDocument();
    });

    it('should update selection summary when seat is selected', async () => {
      const user = userEvent.setup();
      render(<SeatSelectionModal {...defaultProps} />);
      
      // Select 2 seats
      const seatButton = screen.getByText('2');
      await user.click(seatButton);
      
      // Summary should update
      expect(screen.getByText('2 seats')).toBeInTheDocument();
      expect(screen.queryByText('1 seat')).not.toBeInTheDocument();
    });

    it('should call onConfirm with selected seats when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      render(<SeatSelectionModal {...defaultProps} onConfirm={onConfirm} />);
      
      const confirmButton = screen.getByText('Confirm Booking');
      await user.click(confirmButton);
      
      expect(onConfirm).toHaveBeenCalledWith(1);
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SeatSelectionModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByText('✕');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<SeatSelectionModal {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when loading', () => {
      render(<SeatSelectionModal {...defaultProps} loading={true} />);
      
      const confirmButton = screen.getByText('Confirm Booking');
      const closeButton = screen.getByText('✕');
      const cancelButton = screen.getByText('Cancel');
      
      expect(confirmButton).toBeDisabled();
      expect(closeButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading spinner on confirm button when loading', () => {
      render(<SeatSelectionModal {...defaultProps} loading={true} />);
      
      const confirmButton = screen.getByText('Confirm Booking');
      expect(confirmButton).toBeDisabled();
      // Check for loading spinner SVG
      expect(confirmButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should reset selection to 1 when modal opens', () => {
      const { rerender } = render(<SeatSelectionModal {...defaultProps} isOpen={false} />);
      
      // Open modal
      rerender(<SeatSelectionModal {...defaultProps} isOpen={true} />);
      
      expect(screen.getByText('1 seat')).toBeInTheDocument();
      expect(screen.getByText('1')).toHaveClass('bg-primary-600');
    });

    it('should maintain selection when modal reopens', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<SeatSelectionModal {...defaultProps} />);
      
      // Select seat 3
      const seatButton = screen.getByText('3');
      await user.click(seatButton);
      
      // Close and reopen
      rerender(<SeatSelectionModal {...defaultProps} isOpen={false} />);
      rerender(<SeatSelectionModal {...defaultProps} isOpen={true} />);
      
      // Should reset to 1
      expect(screen.getByText('1 seat')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SeatSelectionModal {...defaultProps} />);
      
      // Check that seat buttons have proper aria-labels
      const seatButton1 = screen.getByLabelText('Select 1 seat');
      const seatButton2 = screen.getByLabelText('Select 2 seats');
      expect(seatButton1).toBeInTheDocument();
      expect(seatButton2).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<SeatSelectionModal {...defaultProps} />);
      
      // Focus on first seat button and press Enter
      const firstSeatButton = screen.getByText('1');
      firstSeatButton.focus();
      await user.keyboard('{Enter}');
      
      // Should be selected (primary variant)
      expect(firstSeatButton).toHaveClass('bg-primary-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle maxSeats of 1', () => {
      render(<SeatSelectionModal {...defaultProps} maxSeats={1} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('should handle maxSeats of 8 (maximum)', () => {
      render(<SeatSelectionModal {...defaultProps} maxSeats={8} />);
      
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
      expect(screen.queryByText('9')).not.toBeInTheDocument();
    });

    it('should handle single seat selection correctly', async () => {
      const user = userEvent.setup();
      render(<SeatSelectionModal {...defaultProps} maxSeats={1} />);
      
      // Only one button should be available
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
      
      // Summary should show singular form
      expect(screen.getByText('1 seat')).toBeInTheDocument();
    });
  });
});
