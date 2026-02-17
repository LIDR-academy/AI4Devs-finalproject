import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PaymentConfirmationPage } from '../../../features/payments/PaymentConfirmationPage';
import { ToastProvider } from '../../../shared/components/ToastContext';
import { paymentsApi } from '../../../api/paymentsApi';

// Mock the payments API
jest.mock('../../../api/paymentsApi');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ paymentId: 'payment-1' }),
}));

describe('PaymentConfirmationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderPaymentConfirmationPage = () => {
        return render(
            <BrowserRouter>
                <ToastProvider>
                    <PaymentConfirmationPage />
                </ToastProvider>
            </BrowserRouter>
        );
    };

    it('confirms payment successfully', async () => {
        (paymentsApi.confirmPayment as jest.Mock).mockResolvedValue({
            payment: {
                id: 'payment-1',
                status: 'PAID',
            },
            reservation: {
                id: 'reservation-1',
                status: 'CONFIRMED',
            },
        });

        renderPaymentConfirmationPage();

        // Should show confirming state
        expect(screen.getByText(/Confirmando tu pago/i)).toBeInTheDocument();

        // Wait for confirmation
        await waitFor(() => {
            const successMessages = screen.getAllByText(/¡Pago Confirmado!/i);
            expect(successMessages.length).toBeGreaterThan(0);
        });

        expect(screen.getByText(/Tu reserva ha sido confirmada exitosamente/i)).toBeInTheDocument();
    });

    it('handles confirmation error', async () => {
        (paymentsApi.confirmPayment as jest.Mock).mockRejectedValue({
            response: {
                data: {
                    message: 'Payment confirmation failed',
                },
            },
        });

        renderPaymentConfirmationPage();

        await waitFor(() => {
            const errorMessages = screen.getAllByText(/Payment confirmation failed/i);
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    });
});
