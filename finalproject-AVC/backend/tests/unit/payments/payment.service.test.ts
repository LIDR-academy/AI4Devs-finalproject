import { PrismaClient } from '@prisma/client';
import { PaymentService } from '../../../src/modules/payments/payment.service';
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../../../src/shared/errors/app-error';
import { mockPaymentGateway } from '../../../src/modules/payments/mock-payment-gateway';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        reservation: {
            findUnique: jest.fn(),
        },
        payment: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
        PaymentStatus: {
            PENDING: 'PENDING',
            PAID: 'PAID',
            FAILED: 'FAILED',
        },
        ReservationStatus: {
            CREATED: 'CREATED',
            CONFIRMED: 'CONFIRMED',
        },
    };
});

// Mock payment gateway
jest.mock('../../../src/modules/payments/mock-payment-gateway');

describe('PaymentService', () => {
    let paymentService: PaymentService;
    let prisma: any;

    beforeEach(() => {
        paymentService = new PaymentService();
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('initiatePayment', () => {
        const mockReservation = {
            id: 'reservation-123',
            userId: 'user-123',
            courtId: 'court-123',
            startTime: new Date('2026-02-20T08:00:00.000Z'),
            endTime: new Date('2026-02-20T09:30:00.000Z'),
            status: 'CREATED',
            createdAt: new Date(),
            court: {
                id: 'court-123',
                name: 'Cancha 1',
            },
        };

        const mockPayment = {
            id: 'payment-123',
            reservationId: 'reservation-123',
            amount: 50.0,
            status: 'PENDING',
            provider: 'MOCK_GATEWAY',
            createdAt: new Date(),
        };

        it('should create payment successfully for valid reservation', async () => {
            // Arrange
            prisma.reservation.findUnique.mockResolvedValue(mockReservation);
            prisma.payment.findFirst.mockResolvedValue(null);
            prisma.payment.create.mockResolvedValue(mockPayment);
            (mockPaymentGateway.generatePaymentUrl as jest.Mock).mockReturnValue(
                'https://mock-payment-gateway.com/pay/payment-123'
            );

            // Act
            const result = await paymentService.initiatePayment('user-123', 'reservation-123');

            // Assert
            expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
                where: { id: 'reservation-123' },
                include: {
                    court: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            expect(prisma.payment.create).toHaveBeenCalled();
            expect(result).toHaveProperty('paymentUrl');
            expect(result.userId).toBe('user-123');
        });

        it('should throw NotFoundError when reservation does not exist', async () => {
            // Arrange
            prisma.reservation.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(
                paymentService.initiatePayment('user-123', 'nonexistent-reservation')
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when user does not own reservation', async () => {
            // Arrange
            prisma.reservation.findUnique.mockResolvedValue(mockReservation);

            // Act & Assert
            await expect(
                paymentService.initiatePayment('other-user', 'reservation-123')
            ).rejects.toThrow(ForbiddenError);
            await expect(
                paymentService.initiatePayment('other-user', 'reservation-123')
            ).rejects.toThrow('You can only pay for your own reservations');
        });

        it('should throw ValidationError when reservation is not in CREATED status', async () => {
            // Arrange
            const confirmedReservation = { ...mockReservation, status: 'CONFIRMED' };
            prisma.reservation.findUnique.mockResolvedValue(confirmedReservation);

            // Act & Assert
            await expect(
                paymentService.initiatePayment('user-123', 'reservation-123')
            ).rejects.toThrow(ValidationError);
            await expect(
                paymentService.initiatePayment('user-123', 'reservation-123')
            ).rejects.toThrow('Reservation must be in CREATED status');
        });

        it('should throw ConflictError when payment already exists', async () => {
            // Arrange
            prisma.reservation.findUnique.mockResolvedValue(mockReservation);
            prisma.payment.findFirst.mockResolvedValue(mockPayment);

            // Act & Assert
            await expect(
                paymentService.initiatePayment('user-123', 'reservation-123')
            ).rejects.toThrow(ConflictError);
            await expect(
                paymentService.initiatePayment('user-123', 'reservation-123')
            ).rejects.toThrow('Payment already exists for this reservation');
        });

        it('should create payment with status PENDING', async () => {
            // Arrange
            prisma.reservation.findUnique.mockResolvedValue(mockReservation);
            prisma.payment.findFirst.mockResolvedValue(null);
            prisma.payment.create.mockResolvedValue(mockPayment);
            (mockPaymentGateway.generatePaymentUrl as jest.Mock).mockReturnValue(
                'https://mock-payment-gateway.com/pay/payment-123'
            );

            // Act
            await paymentService.initiatePayment('user-123', 'reservation-123');

            // Assert
            expect(prisma.payment.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'PENDING',
                    }),
                })
            );
        });

        it('should generate payment URL correctly', async () => {
            // Arrange
            prisma.reservation.findUnique.mockResolvedValue(mockReservation);
            prisma.payment.findFirst.mockResolvedValue(null);
            prisma.payment.create.mockResolvedValue(mockPayment);
            (mockPaymentGateway.generatePaymentUrl as jest.Mock).mockReturnValue(
                'https://mock-payment-gateway.com/pay/payment-123'
            );

            // Act
            const result = await paymentService.initiatePayment('user-123', 'reservation-123');

            // Assert
            expect(mockPaymentGateway.generatePaymentUrl).toHaveBeenCalledWith('payment-123');
            expect(result.paymentUrl).toBe('https://mock-payment-gateway.com/pay/payment-123');
        });

        it('should set correct payment amount', async () => {
            // Arrange
            prisma.reservation.findUnique.mockResolvedValue(mockReservation);
            prisma.payment.findFirst.mockResolvedValue(null);
            prisma.payment.create.mockResolvedValue(mockPayment);
            (mockPaymentGateway.generatePaymentUrl as jest.Mock).mockReturnValue(
                'https://mock-payment-gateway.com/pay/payment-123'
            );

            // Act
            await paymentService.initiatePayment('user-123', 'reservation-123');

            // Assert
            expect(prisma.payment.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        amount: 50.0,
                    }),
                })
            );
        });
    });

    describe('confirmPayment', () => {
        const mockPayment = {
            id: 'payment-123',
            reservationId: 'reservation-123',
            amount: 50.0,
            status: 'PENDING',
            provider: 'MOCK_GATEWAY',
            createdAt: new Date(),
            reservation: {
                id: 'reservation-123',
                userId: 'user-123',
                courtId: 'court-123',
                startTime: new Date('2026-02-20T08:00:00.000Z'),
                endTime: new Date('2026-02-20T09:30:00.000Z'),
                status: 'CREATED',
                createdAt: new Date(),
            },
        };

        it('should confirm payment successfully', async () => {
            // Arrange
            prisma.payment.findUnique.mockResolvedValue(mockPayment);
            (mockPaymentGateway.processPayment as jest.Mock).mockResolvedValue(true);
            prisma.$transaction.mockResolvedValue([
                { ...mockPayment, status: 'PAID' },
                { id: 'reservation-123', status: 'CONFIRMED' },
            ]);
            (mockPaymentGateway.generatePaymentUrl as jest.Mock).mockReturnValue(
                'https://mock-payment-gateway.com/pay/payment-123'
            );

            // Act
            const result = await paymentService.confirmPayment('payment-123', 'user-123');

            // Assert
            expect(mockPaymentGateway.processPayment).toHaveBeenCalledWith('payment-123');
            expect(result).toHaveProperty('payment');
            expect(result).toHaveProperty('reservation');
        });

        it('should update payment status to PAID', async () => {
            // Arrange
            prisma.payment.findUnique.mockResolvedValue(mockPayment);
            (mockPaymentGateway.processPayment as jest.Mock).mockResolvedValue(true);
            const updatedPayment = { ...mockPayment, status: 'PAID' };
            prisma.$transaction.mockResolvedValue([
                updatedPayment,
                { id: 'reservation-123', status: 'CONFIRMED' },
            ]);
            (mockPaymentGateway.generatePaymentUrl as jest.Mock).mockReturnValue(
                'https://mock-payment-gateway.com/pay/payment-123'
            );

            // Act
            const result = await paymentService.confirmPayment('payment-123', 'user-123');

            // Assert
            expect(result.payment.status).toBe('PAID');
        });

        it('should update reservation status to CONFIRMED', async () => {
            // Arrange
            prisma.payment.findUnique.mockResolvedValue(mockPayment);
            (mockPaymentGateway.processPayment as jest.Mock).mockResolvedValue(true);
            prisma.$transaction.mockResolvedValue([
                { ...mockPayment, status: 'PAID' },
                { id: 'reservation-123', status: 'CONFIRMED' },
            ]);
            (mockPaymentGateway.generatePaymentUrl as jest.Mock).mockReturnValue(
                'https://mock-payment-gateway.com/pay/payment-123'
            );

            // Act
            const result = await paymentService.confirmPayment('payment-123', 'user-123');

            // Assert
            expect(result.reservation.status).toBe('CONFIRMED');
        });

        it('should throw NotFoundError when payment does not exist', async () => {
            // Arrange
            prisma.payment.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(
                paymentService.confirmPayment('nonexistent-payment', 'user-123')
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when user does not own payment', async () => {
            // Arrange
            prisma.payment.findUnique.mockResolvedValue(mockPayment);

            // Act & Assert
            await expect(
                paymentService.confirmPayment('payment-123', 'other-user')
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw ConflictError when payment already confirmed', async () => {
            // Arrange
            const paidPayment = { ...mockPayment, status: 'PAID' };
            prisma.payment.findUnique.mockResolvedValue(paidPayment);

            // Act & Assert
            await expect(
                paymentService.confirmPayment('payment-123', 'user-123')
            ).rejects.toThrow(ConflictError);
            await expect(
                paymentService.confirmPayment('payment-123', 'user-123')
            ).rejects.toThrow('Payment has already been processed');
        });
    });
});
