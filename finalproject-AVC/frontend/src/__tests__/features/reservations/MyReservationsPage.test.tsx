import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MyReservationsPage } from '../../../features/reservations/MyReservationsPage';
import { ToastProvider } from '../../../shared/components/ToastContext';
import { reservationsApi } from '../../../api/reservationsApi';

// Mock the reservations API
jest.mock('../../../api/reservationsApi');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('MyReservationsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderMyReservationsPage = () => {
        return render(
            <BrowserRouter>
                <ToastProvider>
                    <MyReservationsPage />
                </ToastProvider>
            </BrowserRouter>
        );
    };

    it('renders reservations list', async () => {
        const mockReservations = [
            {
                id: '1',
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
            },
            {
                id: '2',
                courtId: 'court-2',
                userId: 'user-1',
                startTime: '2026-02-18T14:00:00Z',
                endTime: '2026-02-18T15:00:00Z',
                status: 'CONFIRMED',
                createdAt: new Date().toISOString(),
                court: {
                    id: 'court-2',
                    name: 'Cancha 2',
                },
            },
        ];

        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue(mockReservations);

        renderMyReservationsPage();

        // Should show loading initially
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();

        // Wait for reservations to load
        await waitFor(() => {
            expect(screen.getByText('Mis Reservas')).toBeInTheDocument();
        });

        // Should display reservations
        expect(screen.getByText('Cancha 1')).toBeInTheDocument();
        expect(screen.getByText('Cancha 2')).toBeInTheDocument();
    });

    it('filters reservations by status', async () => {
        const mockReservations = [
            {
                id: '1',
                courtId: 'court-1',
                userId: 'user-1',
                startTime: '2026-02-17T10:00:00Z',
                endTime: '2026-02-17T11:00:00Z',
                status: 'CREATED',
                createdAt: new Date().toISOString(),
                court: { id: 'court-1', name: 'Cancha 1' },
            },
            {
                id: '2',
                courtId: 'court-2',
                userId: 'user-1',
                startTime: '2026-02-18T14:00:00Z',
                endTime: '2026-02-18T15:00:00Z',
                status: 'CONFIRMED',
                createdAt: new Date().toISOString(),
                court: { id: 'court-2', name: 'Cancha 2' },
            },
        ];

        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue(mockReservations);

        renderMyReservationsPage();

        await waitFor(() => {
            expect(screen.getByText('Cancha 1')).toBeInTheDocument();
        });

        // Click on "Pendientes" filter
        fireEvent.click(screen.getByText(/Pendientes/i));

        // Should only show pending reservation
        expect(screen.getByText('Cancha 1')).toBeInTheDocument();
        expect(screen.queryByText('Cancha 2')).not.toBeInTheDocument();
    });

    it('shows empty state when no reservations', async () => {
        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue([]);

        renderMyReservationsPage();

        await waitFor(() => {
            expect(screen.getByText(/No tienes reservas aún/i)).toBeInTheDocument();
        });

        expect(screen.getByText('Reservar una Cancha')).toBeInTheDocument();
    });

    it('handles error when fetching reservations', async () => {
        (reservationsApi.getMyReservations as jest.Mock).mockRejectedValue({
            response: {
                data: {
                    message: 'Error al cargar reservas',
                },
            },
        });

        renderMyReservationsPage();

        await waitFor(() => {
            const errorMessages = screen.getAllByText(/Error al cargar reservas/i);
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    });

    it('navigates to payment when pay button is clicked', async () => {
        const mockReservations = [
            {
                id: 'reservation-1',
                courtId: 'court-1',
                userId: 'user-1',
                startTime: '2026-02-17T10:00:00Z',
                endTime: '2026-02-17T11:00:00Z',
                status: 'CREATED',
                createdAt: new Date().toISOString(),
                court: { id: 'court-1', name: 'Cancha 1' },
            },
        ];

        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue(mockReservations);

        renderMyReservationsPage();

        await waitFor(() => {
            expect(screen.getByText('Pagar Ahora')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Pagar Ahora'));

        expect(mockNavigate).toHaveBeenCalledWith('/payments/initiate/reservation-1');
    });
});
