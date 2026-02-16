import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PaymentConfirmationPage } from '../../../src/features/payments/PaymentConfirmationPage';
import { ToastProvider } from '../../../src/shared/components/ToastContext';
import { paymentsApi } from '../../../src/api/paymentsApi';

// Mock the payments API
jest.mock('../../../src/api/paymentsApi');

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
            expect(screen.getByText(/¡Pago Confirmado!/i)).toBeInTheDocument();
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
            expect(screen.getByText(/Error al confirmar el pago/i)).toBeInTheDocument();
        });
    });
});
