import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PaymentInitiationPage } from '../../../features/payments/PaymentInitiationPage';
import { ToastProvider } from '../../../shared/components/ToastContext';
import { paymentsApi } from '../../../api/paymentsApi';
import { reservationsApi } from '../../../api/reservationsApi';

// Mock the APIs
jest.mock('../../../api/paymentsApi');
jest.mock('../../../api/reservationsApi');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ reservationId: 'reservation-1' }),
}));

describe('PaymentInitiationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete (window as any).location;
        (window as any).location = { href: '' };
    });

    const mockReservation = {
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

    const renderPaymentInitiationPage = () => {
        return render(
            <BrowserRouter>
                <ToastProvider>
                    <PaymentInitiationPage />
                </ToastProvider>
            </BrowserRouter>
        );
    };

    it('renders payment initiation page', async () => {
        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue([mockReservation]);

        renderPaymentInitiationPage();

        await waitFor(() => {
            expect(screen.getByText('Pagar Reserva')).toBeInTheDocument();
        });

        expect(screen.getByText('Cancha 1')).toBeInTheDocument();
        expect(screen.getByText(/Total a pagar/i)).toBeInTheDocument();
    });

    it('initiates payment and redirects to gateway', async () => {
        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue([mockReservation]);
        (paymentsApi.initiatePayment as jest.Mock).mockResolvedValue({
            id: 'payment-1',
            paymentUrl: 'http://localhost:5173/mock-payment-gateway?paymentId=payment-1&amount=50.00',
        });

        renderPaymentInitiationPage();

        await waitFor(() => {
            expect(screen.getByText('Proceder al Pago')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Proceder al Pago'));

        await waitFor(() => {
            expect(paymentsApi.initiatePayment).toHaveBeenCalledWith('reservation-1');
        });
    });

    it('redirects if reservation not found', async () => {
        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue([]);

        renderPaymentInitiationPage();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/reservations');
        });
    });

    it('redirects if reservation already paid', async () => {
        const paidReservation = {
            ...mockReservation,
            status: 'CONFIRMED',
        };

        (reservationsApi.getMyReservations as jest.Mock).mockResolvedValue([paidReservation]);

        renderPaymentInitiationPage();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/reservations');
        });
    });
});
