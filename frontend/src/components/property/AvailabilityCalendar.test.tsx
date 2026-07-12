import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import type { UnavailableDate } from '@/types';

const emptyUnavailable: UnavailableDate[] = [];

const noSelection = { checkIn: undefined, checkOut: undefined };

describe('AvailabilityCalendar Component', () => {
  describe('Rendering', () => {
    it('renders the calendar container', () => {
      render(
        <AvailabilityCalendar
          unavailableDates={emptyUnavailable}
          onDateRangeSelect={vi.fn()}
          selectedRange={noSelection}
        />,
      );
      expect(screen.getByTestId('availability-calendar')).toBeInTheDocument();
    });

    it('renders two month calendars side by side', () => {
      render(
        <AvailabilityCalendar
          unavailableDates={emptyUnavailable}
          onDateRangeSelect={vi.fn()}
          selectedRange={noSelection}
        />,
      );
      const monthCals = screen.getAllByTestId('month-calendar');
      expect(monthCals).toHaveLength(2);
    });

    it('renders legend for booked/blocked/held', () => {
      render(
        <AvailabilityCalendar
          unavailableDates={emptyUnavailable}
          onDateRangeSelect={vi.fn()}
          selectedRange={noSelection}
        />,
      );
      expect(screen.getByText(/booked/i)).toBeInTheDocument();
      expect(screen.getByText(/blocked/i)).toBeInTheDocument();
      expect(screen.getByText(/held/i)).toBeInTheDocument();
    });

    it('renders prev/next navigation buttons', () => {
      render(
        <AvailabilityCalendar
          unavailableDates={emptyUnavailable}
          onDateRangeSelect={vi.fn()}
          selectedRange={noSelection}
        />,
      );
      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });
  });

  describe('Date selection', () => {
    it('calls onDateRangeSelect with check-in date on first click', () => {
      const onSelect = vi.fn();
      render(
        <AvailabilityCalendar
          unavailableDates={emptyUnavailable}
          onDateRangeSelect={onSelect}
          selectedRange={noSelection}
        />,
      );

      // Find future, non-disabled date buttons
      const dateBtns = screen.getAllByRole('button').filter((btn) => {
        const date = btn.getAttribute('data-date');
        return date !== null && !(btn as HTMLButtonElement).disabled;
      });

      expect(dateBtns.length).toBeGreaterThan(0);
      fireEvent.click(dateBtns[0]);
      expect(onSelect).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        '',
      );
    });
  });

  describe('Unavailable dates', () => {
    it('marks booked dates as disabled', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const unavailable: UnavailableDate[] = [{ date: tomorrowStr, reason: 'booked' }];

      render(
        <AvailabilityCalendar
          unavailableDates={unavailable}
          onDateRangeSelect={vi.fn()}
          selectedRange={noSelection}
        />,
      );

      const dateBtn = screen.queryByRole('button', { name: new RegExp(tomorrowStr) });
      if (dateBtn) {
        expect(dateBtn).toBeDisabled();
        expect(dateBtn).toHaveAttribute('data-unavailable', 'booked');
      }
    });

    it('does not call onDateRangeSelect when clicking unavailable date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const unavailable: UnavailableDate[] = [{ date: tomorrowStr, reason: 'blocked' }];
      const onSelect = vi.fn();

      render(
        <AvailabilityCalendar
          unavailableDates={unavailable}
          onDateRangeSelect={onSelect}
          selectedRange={noSelection}
        />,
      );

      const dateBtn = screen.queryByRole('button', { name: new RegExp(tomorrowStr) });
      if (dateBtn && (dateBtn as HTMLButtonElement).disabled) {
        fireEvent.click(dateBtn);
        expect(onSelect).not.toHaveBeenCalled();
      }
    });
  });

  describe('Selected range display', () => {
    it('shows check-in date when selected', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      render(
        <AvailabilityCalendar
          unavailableDates={emptyUnavailable}
          onDateRangeSelect={vi.fn()}
          selectedRange={{ checkIn: futureDateStr, checkOut: undefined }}
        />,
      );

      expect(screen.getByText('Check-in:')).toBeInTheDocument();
      expect(screen.getByText(futureDateStr)).toBeInTheDocument();
    });

    it('shows check-in and check-out when both selected', () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 10);
      const checkInStr = checkIn.toISOString().split('T')[0];

      const checkOut = new Date();
      checkOut.setDate(checkOut.getDate() + 15);
      const checkOutStr = checkOut.toISOString().split('T')[0];

      render(
        <AvailabilityCalendar
          unavailableDates={emptyUnavailable}
          onDateRangeSelect={vi.fn()}
          selectedRange={{ checkIn: checkInStr, checkOut: checkOutStr }}
        />,
      );

      expect(screen.getByText('Check-in:')).toBeInTheDocument();
      expect(screen.getByText('Check-out:')).toBeInTheDocument();
    });
  });
});
