import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { authRoutes } from '../../../src/modules/auth/auth.routes';
import { errorHandler } from '../../../src/shared/errors/error-handler';
import { config } from '../../../src/shared/config';

const prisma = new PrismaClient();

describe('POST /api/v1/auth/login', () => {
    let app: FastifyInstance;
    let testUser: any;

    beforeAll(async () => {
        // Create Fastify app
        app = Fastify();

        // Register JWT plugin
        app.register(jwt, {
            secret: config.jwtSecret,
        });

        // Register auth routes
        app.register(authRoutes, { prefix: '/api/v1/auth' });

        // Register error handler
        app.setErrorHandler(errorHandler);

        await app.ready();

        // Create test user
        const passwordHash = await bcrypt.hash('testpassword123', 10);
        testUser = await prisma.user.create({
            data: {
                email: 'integration-test@scpadel.com',
                passwordHash,
                role: 'PLAYER',
                active: true,
            },
        });
    });

    afterAll(async () => {
        // Clean up test user
        await prisma.user.deleteMany({
            where: {
                email: 'integration-test@scpadel.com',
            },
        });

        await app.close();
        await prisma.$disconnect();
    });

    it('should return JWT token when credentials are valid', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'integration-test@scpadel.com',
                password: 'testpassword123',
            },
        });

        // Assert
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('token');
        expect(typeof body.token).toBe('string');

        // Verify token can be decoded
        const decoded = app.jwt.decode(body.token) as any;
        expect(decoded).toHaveProperty('id', testUser.id);
        expect(decoded).toHaveProperty('email', testUser.email);
        expect(decoded).toHaveProperty('role', testUser.role);
    });

    it('should return 401 when email does not exist', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'nonexistent@scpadel.com',
                password: 'testpassword123',
            },
        });

        // Assert
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'UNAUTHORIZED');
        expect(body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 when password is incorrect', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'integration-test@scpadel.com',
                password: 'wrongpassword',
            },
        });

        // Assert
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'UNAUTHORIZED');
        expect(body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 when email is missing', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                password: 'testpassword123',
            },
        });

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'integration-test@scpadel.com',
            },
        });

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it('should return 400 when email format is invalid', async () => {
        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'invalid-email',
                password: 'testpassword123',
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
            url: '/api/v1/auth/login',
            payload: {
                email: 'integration-test@scpadel.com',
                password: '12345',
            },
        });

        // Assert
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'VALIDATION_ERROR');
    });

    it('should return 401 when user is inactive', async () => {
        // Arrange - Create inactive user
        const passwordHash = await bcrypt.hash('testpassword123', 10);
        const inactiveUser = await prisma.user.create({
            data: {
                email: 'inactive-test@scpadel.com',
                passwordHash,
                role: 'PLAYER',
                active: false,
            },
        });

        // Act
        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'inactive-test@scpadel.com',
                password: 'testpassword123',
            },
        });

        // Assert
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'UNAUTHORIZED');
        expect(body).toHaveProperty('message', 'User account is inactive');

        // Cleanup
        await prisma.user.delete({ where: { id: inactiveUser.id } });
    });
});
