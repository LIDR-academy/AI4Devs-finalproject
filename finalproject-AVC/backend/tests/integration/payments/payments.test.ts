import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { authRoutes } from '../../../src/modules/auth/auth.routes';
import { reservationRoutes } from '../../../src/modules/reservations/reservation.routes';
import { paymentRoutes } from '../../../src/modules/payments/payment.routes';
import { errorHandler } from '../../../src/shared/errors/error-handler';
import { config } from '../../../src/shared/config';

const prisma = new PrismaClient();

describe('Payment Endpoints', () => {
    let app: FastifyInstance;
    let playerToken: string;
    let playerId: string;
    let otherPlayerToken: string;
    let otherPlayerId: string;
    let testCourt: any;
    let testReservation: any;

    beforeAll(async () => {
        // Create Fastify app
        app = Fastify();

        // Register JWT plugin
        app.register(jwt, {
            secret: config.jwtSecret,
        });

        // Register routes
        app.register(authRoutes, { prefix: '/api/v1/auth' });
        app.register(reservationRoutes, { prefix: '/api/v1' });
        app.register(paymentRoutes, { prefix: '/api/v1' });

        // Register error handler
        app.setErrorHandler(errorHandler);

        await app.ready();

        // Create player user and get token
        const playerPasswordHash = await bcrypt.hash('player123', 10);
        const player = await prisma.user.upsert({
            where: { email: 'payment-test-player@scpadel.com' },
            update: {},
            create: {
                email: 'payment-test-player@scpadel.com',
                passwordHash: playerPasswordHash,
                role: 'PLAYER',
                active: true,
            },
        });

        playerId = player.id;
        playerToken = app.jwt.sign({
            id: player.id,
            email: player.email,
            role: player.role,
        });

        // Create another player user
        const otherPlayerPasswordHash = await bcrypt.hash('player123', 10);
        const otherPlayer = await prisma.user.upsert({
            where: { email: 'payment-test-other-player@scpadel.com' },
            update: {},
            create: {
                email: 'payment-test-other-player@scpadel.com',
                passwordHash: otherPlayerPasswordHash,
                role: 'PLAYER',
                active: true,
            },
        });

        otherPlayerId = otherPlayer.id;
        otherPlayerToken = app.jwt.sign({
            id: otherPlayer.id,
            email: otherPlayer.email,
            role: otherPlayer.role,
        });

        // Create a test court
        testCourt = await prisma.court.create({
            data: {
                name: 'Test Court for Payments',
                active: true,
            },
        });
    });

    afterAll(async () => {
        // Clean up
        await prisma.payment.deleteMany({
            where: {
                reservation: {
                    courtId: testCourt.id,
                },
            },
        });
        await prisma.reservation.deleteMany({
            where: { courtId: testCourt.id },
        });
        await prisma.court.delete({ where: { id: testCourt.id } });
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ['payment-test-player@scpadel.com', 'payment-test-other-player@scpadel.com'],
                },
            },
        });

        await app.close();
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Create a test reservation before each test
        testReservation = await prisma.reservation.create({
            data: {
                userId: playerId,
                courtId: testCourt.id,
                startTime: new Date('2026-02-25T08:00:00.000Z'),
                endTime: new Date('2026-02-25T09:30:00.000Z'),
                status: 'CREATED',
            },
        });
    });

    afterEach(async () => {
        // Clean up payments and reservations after each test
        await prisma.payment.deleteMany({
            where: {
                reservation: {
                    courtId: testCourt.id,
                },
            },
        });
        await prisma.reservation.deleteMany({
            where: { courtId: testCourt.id },
        });
    });

    describe('POST /api/v1/payments', () => {
        it('should create payment with valid reservation', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });

            // Assert
            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('id');
            expect(body).toHaveProperty('reservationId', testReservation.id);
            expect(body).toHaveProperty('userId', playerId);
            expect(body).toHaveProperty('amount', 50);
            expect(body).toHaveProperty('status', 'PENDING');
            expect(body).toHaveProperty('paymentUrl');
            expect(body.paymentUrl).toContain('mock-payment-gateway.com');
        });

        it('should return 401 when not authenticated', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                payload: {
                    reservationId: testReservation.id,
                },
            });

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 404 when reservation does not exist', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: '00000000-0000-0000-0000-000000000999',
                },
            });

            // Assert
            expect(response.statusCode).toBe(404);
        });

        it('should return 403 when user does not own reservation', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${otherPlayerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });

            // Assert
            expect(response.statusCode).toBe(403);
        });

        it('should return 409 when payment already exists', async () => {
            // Arrange - Create first payment
            await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });

            // Act - Try to create duplicate payment
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });

            // Assert
            expect(response.statusCode).toBe(409);
        });

        it('should verify payment has status PENDING', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });

            const body = JSON.parse(response.body);

            // Verify in database
            const payment = await prisma.payment.findUnique({
                where: { id: body.id },
            });

            expect(payment?.status).toBe('PENDING');
        });

        it('should verify payment URL is returned', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });

            const body = JSON.parse(response.body);

            // Assert
            expect(body.paymentUrl).toBeDefined();
            expect(body.paymentUrl).toContain(body.id);
        });

        it('should verify payment amount is correct', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });

            const body = JSON.parse(response.body);

            // Assert
            expect(body.amount).toBe(50);
        });
    });

    describe('POST /api/v1/payments/:paymentId/confirm', () => {
        let testPayment: any;

        beforeEach(async () => {
            // Create a payment before each test
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: testReservation.id,
                },
            });
            testPayment = JSON.parse(response.body);
        });

        it('should confirm payment successfully', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${testPayment.id}/confirm`,
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('payment');
            expect(body).toHaveProperty('reservation');
        });

        it('should return 401 when not authenticated', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${testPayment.id}/confirm`,
            });

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 404 when payment does not exist', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/payments/00000000-0000-0000-0000-000000000999/confirm',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toBe(404);
        });

        it('should return 403 when user does not own payment', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${testPayment.id}/confirm`,
                headers: {
                    authorization: `Bearer ${otherPlayerToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toBe(403);
        });

        it('should return 409 when payment already confirmed', async () => {
            // Arrange - Confirm payment first time
            await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${testPayment.id}/confirm`,
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Act - Try to confirm again
            const response = await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${testPayment.id}/confirm`,
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toBe(409);
        });

        it('should verify payment status changes to PAID', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${testPayment.id}/confirm`,
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            const body = JSON.parse(response.body);

            // Assert
            expect(body.payment.status).toBe('PAID');

            // Verify in database
            const payment = await prisma.payment.findUnique({
                where: { id: testPayment.id },
            });
            expect(payment?.status).toBe('PAID');
        });

        it('should verify reservation status changes to CONFIRMED', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${testPayment.id}/confirm`,
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            const body = JSON.parse(response.body);

            // Assert
            expect(body.reservation.status).toBe('CONFIRMED');

            // Verify in database
            const reservation = await prisma.reservation.findUnique({
                where: { id: testReservation.id },
            });
            expect(reservation?.status).toBe('CONFIRMED');
        });

        it('should verify complete payment flow (create → confirm)', async () => {
            // Arrange - Create new reservation
            const newReservation = await prisma.reservation.create({
                data: {
                    userId: playerId,
                    courtId: testCourt.id,
                    startTime: new Date('2026-02-26T10:00:00.000Z'),
                    endTime: new Date('2026-02-26T11:30:00.000Z'),
                    status: 'CREATED',
                },
            });

            // Act 1 - Create payment
            const createResponse = await app.inject({
                method: 'POST',
                url: '/api/v1/payments',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    reservationId: newReservation.id,
                },
            });

            expect(createResponse.statusCode).toBe(201);
            const payment = JSON.parse(createResponse.body);

            // Act 2 - Confirm payment
            const confirmResponse = await app.inject({
                method: 'POST',
                url: `/api/v1/payments/${payment.id}/confirm`,
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            expect(confirmResponse.statusCode).toBe(200);
            const result = JSON.parse(confirmResponse.body);

            // Assert - Verify complete flow
            expect(result.payment.status).toBe('PAID');
            expect(result.reservation.status).toBe('CONFIRMED');

            // Verify in database
            const dbReservation = await prisma.reservation.findUnique({
                where: { id: newReservation.id },
            });
            expect(dbReservation?.status).toBe('CONFIRMED');
        });
    });
});
