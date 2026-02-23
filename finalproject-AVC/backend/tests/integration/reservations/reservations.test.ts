import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { authRoutes } from '../../../src/modules/auth/auth.routes';
import { reservationRoutes } from '../../../src/modules/reservations/reservation.routes';
import { errorHandler } from '../../../src/shared/errors/error-handler';
import { config } from '../../../src/shared/config';

const prisma = new PrismaClient();

describe('Reservation Endpoints', () => {
    let app: FastifyInstance;
    let playerToken: string;
    let playerId: string;
    let otherPlayerToken: string;
    let otherPlayerId: string;
    let testCourt: any;

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

        // Register error handler
        app.setErrorHandler(errorHandler);

        await app.ready();

        // Create player user and get token
        const playerPasswordHash = await bcrypt.hash('player123', 10);
        const player = await prisma.user.upsert({
            where: { email: 'reservation-test-player@scpadel.com' },
            update: {},
            create: {
                email: 'reservation-test-player@scpadel.com',
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
            where: { email: 'reservation-test-other-player@scpadel.com' },
            update: {},
            create: {
                email: 'reservation-test-other-player@scpadel.com',
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
                name: 'Test Court for Reservations',
                active: true,
            },
        });
    });

    afterAll(async () => {
        // Clean up
        await prisma.reservation.deleteMany({
            where: { courtId: testCourt.id },
        });
        await prisma.court.delete({ where: { id: testCourt.id } });
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        'reservation-test-player@scpadel.com',
                        'reservation-test-other-player@scpadel.com',
                    ],
                },
            },
        });

        await app.close();
        await prisma.$disconnect();
    });

    afterEach(async () => {
        // Clean up reservations after each test
        await prisma.reservation.deleteMany({
            where: { courtId: testCourt.id },
        });
    });

    describe('POST /api/v1/reservations', () => {
        it('should create reservation with valid data', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('id');
            expect(body).toHaveProperty('courtId', testCourt.id);
            expect(body).toHaveProperty('userId', playerId);
            expect(body).toHaveProperty('status', 'CREATED');
            expect(body).toHaveProperty('court');
            expect(body.court).toHaveProperty('id', testCourt.id);
            expect(body.court).toHaveProperty('name', testCourt.name);
        });

        it('should return 401 when not authenticated', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 409 when reservation overlaps', async () => {
            // Arrange - Create first reservation
            await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Act - Try to create overlapping reservation
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${otherPlayerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:30:00.000Z',
                    endTime: '2026-02-20T10:00:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(409);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('error', 'CONFLICT');
        });

        it('should return 404 when court does not exist', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: '00000000-0000-0000-0000-000000000999',
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(404);
        });

        it('should return 400 when endTime is before startTime', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T09:30:00.000Z',
                    endTime: '2026-02-20T08:00:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 when courtId is missing', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 when startTime is missing', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 when endTime is missing', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                },
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should verify reservation is created in database', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            const body = JSON.parse(response.body);

            // Verify in database
            const reservation = await prisma.reservation.findUnique({
                where: { id: body.id },
            });

            expect(reservation).not.toBeNull();
            expect(reservation?.courtId).toBe(testCourt.id);
            expect(reservation?.userId).toBe(playerId);
        });

        it('should verify reservation has status CREATED', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            const body = JSON.parse(response.body);
            expect(body.status).toBe('CREATED');

            // Verify in database
            const reservation = await prisma.reservation.findUnique({
                where: { id: body.id },
            });
            expect(reservation?.status).toBe('CREATED');
        });
    });

    describe('GET /api/v1/reservations/my', () => {
        it('should return user reservations', async () => {
            // Arrange - Create reservation
            await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Act
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/reservations/my',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
            expect(body[0]).toHaveProperty('id');
            expect(body[0]).toHaveProperty('courtId');
            expect(body[0]).toHaveProperty('userId', playerId);
            expect(body[0]).toHaveProperty('court');
        });

        it('should return empty array when user has no reservations', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/reservations/my',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBe(0);
        });

        it('should return 401 when not authenticated', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/reservations/my',
            });

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should only return current user reservations', async () => {
            // Arrange - Create reservations for both users
            await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${otherPlayerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T10:00:00.000Z',
                    endTime: '2026-02-20T11:30:00.000Z',
                },
            });

            // Act - Get player's reservations
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/reservations/my',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Assert
            const body = JSON.parse(response.body);
            expect(body.length).toBe(1);
            expect(body[0].userId).toBe(playerId);
        });

        it('should include court details in response', async () => {
            // Arrange
            await app.inject({
                method: 'POST',
                url: '/api/v1/reservations',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    courtId: testCourt.id,
                    startTime: '2026-02-20T08:00:00.000Z',
                    endTime: '2026-02-20T09:30:00.000Z',
                },
            });

            // Act
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/reservations/my',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
            });

            // Assert
            const body = JSON.parse(response.body);
            expect(body[0].court).toHaveProperty('id', testCourt.id);
            expect(body[0].court).toHaveProperty('name', testCourt.name);
        });
    });
});
