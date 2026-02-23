import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { authRoutes } from '../../../src/modules/auth/auth.routes';
import { courtRoutes } from '../../../src/modules/courts/court.routes';
import { errorHandler } from '../../../src/shared/errors/error-handler';
import { config } from '../../../src/shared/config';

const prisma = new PrismaClient();

describe('Court Endpoints', () => {
    let app: FastifyInstance;
    let adminToken: string;
    let playerToken: string;
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
        app.register(courtRoutes, { prefix: '/api/v1' });

        // Register error handler
        app.setErrorHandler(errorHandler);

        await app.ready();

        // Create admin user and get token
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'court-test-admin@scpadel.com' },
            update: {},
            create: {
                email: 'court-test-admin@scpadel.com',
                passwordHash: adminPasswordHash,
                role: 'ADMIN',
                active: true,
            },
        });

        adminToken = app.jwt.sign({
            id: admin.id,
            email: admin.email,
            role: admin.role,
        });

        // Create player user and get token
        const playerPasswordHash = await bcrypt.hash('player123', 10);
        const player = await prisma.user.upsert({
            where: { email: 'court-test-player@scpadel.com' },
            update: {},
            create: {
                email: 'court-test-player@scpadel.com',
                passwordHash: playerPasswordHash,
                role: 'PLAYER',
                active: true,
            },
        });

        playerToken = app.jwt.sign({
            id: player.id,
            email: player.email,
            role: player.role,
        });

        // Create a test court
        testCourt = await prisma.court.create({
            data: {
                name: 'Test Court for Integration',
                active: true,
            },
        });
    });

    afterAll(async () => {
        // Clean up
        await prisma.reservation.deleteMany({
            where: { courtId: testCourt.id },
        });
        await prisma.court.deleteMany({
            where: {
                name: {
                    in: ['Test Court for Integration', 'New Court Test', 'Court Created by Admin'],
                },
            },
        });
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ['court-test-admin@scpadel.com', 'court-test-player@scpadel.com'],
                },
            },
        });

        await app.close();
        await prisma.$disconnect();
    });

    describe('GET /api/v1/courts', () => {
        it('should return list of active courts', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/courts',
            });

            // Assert
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
            expect(body[0]).toHaveProperty('id');
            expect(body[0]).toHaveProperty('name');
            expect(body[0]).toHaveProperty('active');
            expect(body[0]).toHaveProperty('createdAt');
        });

        it('should exclude inactive courts', async () => {
            // Arrange - Create inactive court
            const inactiveCourt = await prisma.court.create({
                data: {
                    name: 'Inactive Court',
                    active: false,
                },
            });

            // Act
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/courts',
            });

            // Assert
            const body = JSON.parse(response.body);
            const foundInactive = body.find((c: any) => c.id === inactiveCourt.id);
            expect(foundInactive).toBeUndefined();

            // Cleanup
            await prisma.court.delete({ where: { id: inactiveCourt.id } });
        });
    });

    describe('POST /api/v1/courts', () => {
        it('should create court when authenticated as ADMIN', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/courts',
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
                payload: {
                    name: 'Court Created by Admin',
                },
            });

            // Assert
            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('id');
            expect(body).toHaveProperty('name', 'Court Created by Admin');
            expect(body).toHaveProperty('active', true);
            expect(body).toHaveProperty('createdAt');
        });

        it('should return 401 when not authenticated', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/courts',
                payload: {
                    name: 'Unauthorized Court',
                },
            });

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 when authenticated as PLAYER', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/courts',
                headers: {
                    authorization: `Bearer ${playerToken}`,
                },
                payload: {
                    name: 'Player Court',
                },
            });

            // Assert
            expect(response.statusCode).toBe(403);
        });

        it('should return 400 when name is missing', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/courts',
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
                payload: {},
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 when name is empty', async () => {
            // Act
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/courts',
                headers: {
                    authorization: `Bearer ${adminToken}`,
                },
                payload: {
                    name: '',
                },
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });
    });

    describe('GET /api/v1/courts/:courtId/availability', () => {
        const testDate = '2026-02-15';

        it('should return availability for valid court and date', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/courts/${testCourt.id}/availability?date=${testDate}`,
            });

            // Assert
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);
            expect(body[0]).toHaveProperty('startTime');
            expect(body[0]).toHaveProperty('endTime');
            expect(body[0]).toHaveProperty('available');
        });

        it('should return 404 for non-existent court', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/courts/00000000-0000-0000-0000-000000000999/availability?date=${testDate}`,
            });

            // Assert
            expect(response.statusCode).toBe(404);
        });

        it('should return 400 for invalid date format', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/courts/${testCourt.id}/availability?date=invalid-date`,
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 when date is missing', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/courts/${testCourt.id}/availability`,
            });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should show all slots as available when no reservations', async () => {
            // Act
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/courts/${testCourt.id}/availability?date=${testDate}`,
            });

            // Assert
            const body = JSON.parse(response.body);
            expect(body.every((slot: any) => slot.available === true)).toBe(true);
        });

        it('should show slots as unavailable when reservation exists', async () => {
            // Arrange - Create a reservation
            const reservation = await prisma.reservation.create({
                data: {
                    courtId: testCourt.id,
                    userId: (await prisma.user.findUnique({ where: { email: 'court-test-player@scpadel.com' } }))!.id,
                    startTime: new Date(`${testDate}T08:00:00.000Z`),
                    endTime: new Date(`${testDate}T09:30:00.000Z`),
                    status: 'CREATED',
                },
            });

            // Act
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/courts/${testCourt.id}/availability?date=${testDate}`,
            });

            // Assert
            const body = JSON.parse(response.body);
            const firstSlot = body[0];
            expect(firstSlot.available).toBe(false);

            // Cleanup
            await prisma.reservation.delete({ where: { id: reservation.id } });
        });

        it('should handle multiple reservations correctly', async () => {
            // Arrange - Create multiple reservations
            const userId = (await prisma.user.findUnique({ where: { email: 'court-test-player@scpadel.com' } }))!.id;

            const reservation1 = await prisma.reservation.create({
                data: {
                    courtId: testCourt.id,
                    userId,
                    startTime: new Date(`${testDate}T08:00:00.000Z`),
                    endTime: new Date(`${testDate}T09:30:00.000Z`),
                    status: 'CREATED',
                },
            });

            const reservation2 = await prisma.reservation.create({
                data: {
                    courtId: testCourt.id,
                    userId,
                    startTime: new Date(`${testDate}T11:00:00.000Z`),
                    endTime: new Date(`${testDate}T12:30:00.000Z`),
                    status: 'CREATED',
                },
            });

            // Act
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/courts/${testCourt.id}/availability?date=${testDate}`,
            });

            // Assert
            const body = JSON.parse(response.body);
            // First slot (8:00-9:30) should be unavailable
            expect(body[0].available).toBe(false);
            // Second slot (9:30-11:00) should be available
            expect(body[1].available).toBe(true);
            // Third slot (11:00-12:30) should be unavailable
            expect(body[2].available).toBe(false);

            // Cleanup
            await prisma.reservation.deleteMany({
                where: { id: { in: [reservation1.id, reservation2.id] } },
            });
        });
    });
});
