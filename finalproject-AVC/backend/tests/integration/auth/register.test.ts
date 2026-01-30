import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { authRoutes } from '../../../src/modules/auth/auth.routes';
import { userRoutes } from '../../../src/modules/users/user.routes';
import { errorHandler } from '../../../src/shared/errors/error-handler';
import { config } from '../../../src/shared/config';

const prisma = new PrismaClient();

describe('POST /api/v1/auth/register', () => {
    let app: FastifyInstance;
    let adminToken: string;
    let playerToken: string;

    beforeAll(async () => {
        // Create Fastify app
        app = Fastify();

        // Register JWT plugin
        app.register(jwt, {
            secret: config.jwtSecret,
        });

        // Register routes
        app.register(authRoutes, { prefix: '/api/v1/auth' });
        app.register(userRoutes, { prefix: '/api/v1/auth' });

        // Register error handler
        app.setErrorHandler(errorHandler);

        await app.ready();

        // Create admin user and get token
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'test-admin@scpadel.com' },
            update: {},
            create: {
                email: 'test-admin@scpadel.com',
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
            where: { email: 'test-player@scpadel.com' },
            update: {},
            create: {
                email: 'test-player@scpadel.com',
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
    });

    afterAll(async () => {
        // Clean up test users
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        'test-admin@scpadel.com',
                        'test-player@scpadel.com',
                        'register-test-player@scpadel.com',
                        'register-test-admin@scpadel.com',
                        'duplicate-test@scpadel.com',
                    ],
                },
            },
        });

        await app.close();
        await prisma.$disconnect();
    });

    afterEach(async () => {
        // Clean up created users after each test
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        'register-test-player@scpadel.com',
                        'register-test-admin@scpadel.com',
                        'duplicate-test@scpadel.com',
                    ],
                },
            },
        });
    });

    it('should create a new PLAYER user when authenticated as ADMIN', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'register-test-player@scpadel.com',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Assert
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('email', 'register-test-player@scpadel.com');
        expect(body).toHaveProperty('role', 'PLAYER');
        expect(body).toHaveProperty('active', true);
        expect(body).toHaveProperty('createdAt');
        expect(body).not.toHaveProperty('passwordHash');
        expect(body).not.toHaveProperty('password');

        // Verify user was created in database
        const createdUser = await prisma.user.findUnique({
            where: { email: 'register-test-player@scpadel.com' },
        });
        expect(createdUser).not.toBeNull();
        expect(createdUser?.role).toBe('PLAYER');
    });

    it('should create a new ADMIN user when authenticated as ADMIN', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'register-test-admin@scpadel.com',
                password: 'admin123',
                role: 'ADMIN',
            },
        });

        // Assert
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('role', 'ADMIN');
    });

    it('should return 409 when email already exists', async () => {
        // Arrange - Create a user first
        await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'duplicate-test@scpadel.com',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Act - Try to create user with same email
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'duplicate-test@scpadel.com',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Assert
        expect(response.statusCode).toBe(409);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'CONFLICT');
        expect(body).toHaveProperty('message', 'User with this email already exists');
    });

    it('should return 401 when not authenticated', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                email: 'test@scpadel.com',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Assert
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'UNAUTHORIZED');
    });

    it('should return 403 when authenticated as PLAYER', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${playerToken}`,
            },
            payload: {
                email: 'test@scpadel.com',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Assert
        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'FORBIDDEN');
    });

    it('should return 400 when email format is invalid', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'invalid-email',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Assert
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 when password is too short', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'test@scpadel.com',
                password: '12345',
                role: 'PLAYER',
            },
        });

        // Assert
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 400 when role is missing', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'test@scpadel.com',
                password: 'password123',
            },
        });

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it('should verify created user can login', async () => {
        // Arrange - Create a user
        await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'register-test-player@scpadel.com',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Act - Try to login with created user
        const loginResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'register-test-player@scpadel.com',
                password: 'password123',
            },
        });

        // Assert
        expect(loginResponse.statusCode).toBe(200);
        const body = JSON.parse(loginResponse.body);
        expect(body).toHaveProperty('token');
    });

    it('should verify password is hashed in database', async () => {
        // Arrange - Create a user
        await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: {
                email: 'register-test-player@scpadel.com',
                password: 'password123',
                role: 'PLAYER',
            },
        });

        // Act - Get user from database
        const user = await prisma.user.findUnique({
            where: { email: 'register-test-player@scpadel.com' },
        });

        // Assert
        expect(user).not.toBeNull();
        expect(user?.passwordHash).not.toBe('password123');
        expect(user?.passwordHash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });
});
