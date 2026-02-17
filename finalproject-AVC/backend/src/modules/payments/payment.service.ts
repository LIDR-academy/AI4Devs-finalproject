import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../../shared/errors/app-error';
import { config } from '../../shared/config';
import { mockPaymentGateway } from './mock-payment-gateway';

const prisma = new PrismaClient();

export class PaymentService {
    /**
     * Initiate payment for a reservation
     * @param userId - User ID initiating the payment
     * @param reservationId - Reservation ID to pay for
     * @returns Created payment with payment URL
     * @throws NotFoundError if reservation doesn't exist
     * @throws ForbiddenError if user doesn't own the reservation
     * @throws ValidationError if reservation is not in CREATED status
     * @throws ConflictError if payment already exists for reservation
     */
    async initiatePayment(userId: string, reservationId: string) {
        // Validate reservation exists
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                court: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation');
        }

        // Validate user owns the reservation
        if (reservation.userId !== userId) {
            throw new ForbiddenError('You can only pay for your own reservations');
        }

        // Validate reservation is in CREATED status
        if (reservation.status !== 'CREATED') {
            throw new ValidationError('Reservation must be in CREATED status to initiate payment');
        }

        // Check if payment already exists for this reservation
        const existingPayment = await prisma.payment.findFirst({
            where: { reservationId },
        });

        if (existingPayment) {
            // If payment is already PAID, don't allow creating a new one
            if (existingPayment.status === 'PAID') {
                throw new ConflictError('Payment already completed for this reservation');
            }
            
            // If payment is PENDING or FAILED, reuse it (allow retry)
            const paymentUrl = mockPaymentGateway.generatePaymentUrl(
                existingPayment.id, 
                existingPayment.amount.toNumber()
            );
            
            return {
                ...existingPayment,
                userId: reservation.userId,
                paymentUrl,
            };
        }

        // Create payment with PENDING status
        const payment = await prisma.payment.create({
            data: {
                reservationId,
                amount: config.payment.defaultAmount,
                status: 'PENDING',
                provider: 'MOCK_GATEWAY', // Mock provider for Phase 0
            },
        });

        // Generate payment URL with amount (convert Decimal to number)
        const paymentUrl = mockPaymentGateway.generatePaymentUrl(payment.id, payment.amount.toNumber());

        // Return payment with URL and userId from reservation
        return {
            ...payment,
            userId: reservation.userId,
            paymentUrl,
        };
    }

    /**
     * Confirm payment and update reservation status
     * @param paymentId - Payment ID to confirm
     * @param userId - User ID confirming the payment
     * @returns Updated payment and reservation
     * @throws NotFoundError if payment doesn't exist
     * @throws ForbiddenError if user doesn't own the payment
     * @throws ConflictError if payment is already confirmed
     */
    async confirmPayment(paymentId: string, userId: string) {
        // Validate payment exists
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                reservation: true,
            },
        });

        if (!payment) {
            throw new NotFoundError('Payment');
        }

        // Validate user owns the payment (through reservation)
        if (payment.reservation.userId !== userId) {
            throw new ForbiddenError('You can only confirm your own payments');
        }

        // Validate payment is in PENDING status
        if (payment.status !== 'PENDING') {
            throw new ConflictError('Payment has already been processed');
        }

        // Process payment via mock gateway
        const paymentSuccess = await mockPaymentGateway.processPayment(paymentId);

        if (!paymentSuccess) {
            throw new ValidationError('Payment processing failed');
        }

        // Update payment status to PAID and reservation status to CONFIRMED in a transaction
        const [updatedPayment, updatedReservation] = await prisma.$transaction([
            prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'PAID' },
            }),
            prisma.reservation.update({
                where: { id: payment.reservationId },
                data: { status: 'CONFIRMED' },
            }),
        ]);

        // Generate payment URL for response (convert Decimal to number)
        const paymentUrl = mockPaymentGateway.generatePaymentUrl(paymentId, updatedPayment.amount.toNumber());

        return {
            payment: {
                ...updatedPayment,
                paymentUrl,
            },
            reservation: {
                id: updatedReservation.id,
                status: updatedReservation.status,
            },
        };
    }
}

export const paymentService = new PaymentService();
