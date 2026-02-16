import { render, screen, fireEvent } from '@testing-library/react';
import { TimeSlotGrid } from '../../../src/features/courts/components/TimeSlotGrid';
import { TimeSlot } from '../../../src/shared/types';

describe('TimeSlotGrid', () => {
    const mockTimeSlots: TimeSlot[] = [
        {
            startTime: '2026-02-16T10:00:00Z',
            endTime: '2026-02-16T11:00:00Z',
            available: true,
        },
        {
            startTime: '2026-02-16T11:00:00Z',
            endTime: '2026-02-16T12:00:00Z',
            available: false,
        },
        {
            startTime: '2026-02-16T12:00:00Z',
            endTime: '2026-02-16T13:00:00Z',
            available: true,
        },
    ];

    it('renders all time slots', () => {
        const mockOnSelect = jest.fn();

        render(<TimeSlotGrid timeSlots={mockTimeSlots} onSelectSlot={mockOnSelect} />);

        expect(screen.getByText(/Disponible/i)).toBeInTheDocument();
        expect(screen.getByText(/Ocupado/i)).toBeInTheDocument();
    });

    it('calls onSelectSlot when available slot is clicked', () => {
        const mockOnSelect = jest.fn();

        render(<TimeSlotGrid timeSlots={mockTimeSlots} onSelectSlot={mockOnSelect} />);

        const availableSlots = screen.getAllByText(/Disponible/i);
        fireEvent.click(availableSlots[0]);

        expect(mockOnSelect).toHaveBeenCalledWith(mockTimeSlots[0]);
    });

    it('does not call onSelectSlot when unavailable slot is clicked', () => {
        const mockOnSelect = jest.fn();

        render(<TimeSlotGrid timeSlots={mockTimeSlots} onSelectSlot={mockOnSelect} />);

        const occupiedSlot = screen.getByText(/Ocupado/i);
        fireEvent.click(occupiedSlot);

        expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('shows selected state for selected slot', () => {
        const mockOnSelect = jest.fn();

        render(
            <TimeSlotGrid
                timeSlots={mockTimeSlots}
                onSelectSlot={mockOnSelect}
                selectedSlot={mockTimeSlots[0]}
            />
        );

        expect(screen.getByText(/Seleccionado/i)).toBeInTheDocument();
    });
});
