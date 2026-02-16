import { render, screen } from '@testing-library/react';
import { ReservationCard } from '../../../src/features/reservations/components/ReservationCard';
import { Reservation } from '../../../src/shared/types';

describe('ReservationCard', () => {
    const mockReservation: Reservation = {
        id: 'reservation-1',
        courtId: 'court-1',
        userId: 'user-1',
        startTime: '2026-02-17T10:00:00Z',
        endTime: '2026-02-17T11:00:00Z',
        status: 'CREATED',
        createdAt: new Date().toISOString(),
        court: {
            id: 'court-1',
            name: 'Cancha 1',
        },
    };

    it('renders reservation details', () => {
        render(<ReservationCard reservation={mockReservation} />);

        expect(screen.getByText('Cancha 1')).toBeInTheDocument();
        expect(screen.getByText(/Pendiente de pago/i)).toBeInTheDocument();
    });

    it('shows pay button for pending reservations', () => {
        const mockOnPay = jest.fn();

        render(<ReservationCard reservation={mockReservation} onPayClick={mockOnPay} />);

        expect(screen.getByText('Pagar Ahora')).toBeInTheDocument();
    });

    it('does not show pay button for confirmed reservations', () => {
        const confirmedReservation = {
            ...mockReservation,
            status: 'CONFIRMED',
        };

        render(<ReservationCard reservation={confirmedReservation} />);

        expect(screen.queryByText('Pagar Ahora')).not.toBeInTheDocument();
        expect(screen.getByText(/Confirmada/i)).toBeInTheDocument();
    });

    it('shows correct status badge for cancelled reservations', () => {
        const cancelledReservation = {
            ...mockReservation,
            status: 'CANCELLED',
        };

        render(<ReservationCard reservation={cancelledReservation} />);

        expect(screen.getByText(/Cancelada/i)).toBeInTheDocument();
    });
});
