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

describe('SeatSelectionModal Integration', () => {
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

  describe('Complete Booking Flow', () => {
    it('should complete full booking flow with seat selection', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      
      render(
        <SeatSelectionModal
          {...defaultProps}
          onConfirm={onConfirm}
        />
      );

      // Verify modal is open
      expect(screen.getByText('Select Seats')).toBeInTheDocument();
      expect(screen.getByText('Available seats: 4')).toBeInTheDocument();

      // Verify seat buttons are rendered
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();

      // Verify initial selection
      expect(screen.getByText('1 seat')).toBeInTheDocument();
      expect(screen.getByText('1')).toHaveClass('bg-primary-600');

      // Select 3 seats
      const seatButton3 = screen.getByText('3');
      await user.click(seatButton3);

      // Verify selection updated
      expect(seatButton3).toHaveClass('bg-primary-600');
      expect(screen.getByText('3 seats')).toBeInTheDocument();
      expect(screen.queryByText('1 seat')).not.toBeInTheDocument();

      // Confirm booking
      const confirmButton = screen.getByText('Confirm Booking');
      await user.click(confirmButton);

      // Verify onConfirm was called with correct seats
      expect(onConfirm).toHaveBeenCalledWith(3);
    });

    it('should handle different maxSeats values correctly', () => {
      const { rerender } = render(
        <SeatSelectionModal
          {...defaultProps}
          maxSeats={2}
        />
      );

      // Should only show 1 and 2
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.queryByText('3')).not.toBeInTheDocument();
      expect(screen.queryByText('4')).not.toBeInTheDocument();

      // Test with 1 seat
      rerender(
        <SeatSelectionModal
          {...defaultProps}
          maxSeats={1}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
      expect(screen.getByText('1 seat')).toBeInTheDocument();
    });

    it('should handle loading state correctly', () => {
      render(
        <SeatSelectionModal
          {...defaultProps}
          loading={true}
        />
      );

      const confirmButton = screen.getByText('Confirm Booking');
      const closeButton = screen.getByText('✕');
      const cancelButton = screen.getByText('Cancel');

      // All buttons should be disabled
      expect(confirmButton).toBeDisabled();
      expect(closeButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      // Should show loading spinner
      expect(confirmButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should handle modal close correctly', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(
        <SeatSelectionModal
          {...defaultProps}
          onClose={onClose}
        />
      );

      // Close via X button
      const closeButton = screen.getByText('✕');
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);

      // Close via Cancel button
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<SeatSelectionModal {...defaultProps} />);

      // Focus on first seat button
      const seatButton1 = screen.getByText('1');
      seatButton1.focus();

      // Press Enter to select
      await user.keyboard('{Enter}');
      expect(seatButton1).toHaveClass('bg-primary-600');

      // Tab to next button and select
      await user.tab();
      const seatButton2 = screen.getByText('2');
      await user.keyboard('{Enter}');
      expect(seatButton2).toHaveClass('bg-primary-600');
      expect(seatButton1).not.toHaveClass('bg-primary-600');
    });

    it('should update selection summary when different seats are selected', async () => {
      const user = userEvent.setup();
      
      render(<SeatSelectionModal {...defaultProps} />);

      // Initial state
      expect(screen.getByText('1 seat')).toBeInTheDocument();

      // Select 2 seats
      await user.click(screen.getByText('2'));
      expect(screen.getByText('2 seats')).toBeInTheDocument();
      expect(screen.queryByText('1 seat')).not.toBeInTheDocument();

      // Select 4 seats
      await user.click(screen.getByText('4'));
      expect(screen.getByText('4 seats')).toBeInTheDocument();
      expect(screen.queryByText('2 seats')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle maxSeats of 8 (maximum allowed)', () => {
      render(
        <SeatSelectionModal
          {...defaultProps}
          maxSeats={8}
        />
      );

      // Should show all 8 buttons
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
      expect(screen.queryByText('9')).not.toBeInTheDocument();
    });

    it('should handle rapid seat selection changes', async () => {
      const user = userEvent.setup();
      
      render(<SeatSelectionModal {...defaultProps} />);

      // Rapidly click different seat buttons
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('4'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('3'));

      // Should end up with 3 seats selected
      expect(screen.getByText('3 seats')).toBeInTheDocument();
      expect(screen.getByText('3')).toHaveClass('bg-primary-600');
    });

    it('should maintain state consistency during rapid interactions', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      
      render(
        <SeatSelectionModal
          {...defaultProps}
          onConfirm={onConfirm}
        />
      );

      // Select seats and confirm rapidly
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('Confirm Booking'));

      // Should call onConfirm with the last selected value
      expect(onConfirm).toHaveBeenCalledWith(2);
    });
  });
});
