import { config } from '../../shared/config';

/**
 * Mock Payment Gateway for Phase 0
 * Simulates a payment provider without making real API calls
 */
export class MockPaymentGateway {
    /**
     * Generate a mock payment URL
     * @param paymentId - Payment ID
     * @returns Mock payment URL
     */
    generatePaymentUrl(paymentId: string): string {
        return `${config.payment.mockGatewayUrl}/pay/${paymentId}`;
    }

    /**
     * Simulate payment processing
     * In Phase 0, this always succeeds
     * @param paymentId - Payment ID
     * @returns Promise that resolves to true (always succeeds)
     */
    async processPayment(paymentId: string): Promise<boolean> {
        // Simulate async payment processing with a small delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // In Phase 0, payment always succeeds
        // In future phases, this would make actual API calls to a real payment provider
        console.log(`[MockPaymentGateway] Processing payment ${paymentId}... SUCCESS`);
        return true;
    }
}

export const mockPaymentGateway = new MockPaymentGateway();
