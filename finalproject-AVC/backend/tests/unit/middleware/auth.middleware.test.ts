import { FastifyRequest } from 'fastify';
import { authenticate } from '../../../src/shared/middleware/auth.middleware';
import { authorize } from '../../../src/shared/middleware/authorize.middleware';
import { UnauthorizedError, ForbiddenError } from '../../../src/shared/errors/app-error';
import { Role } from '@prisma/client';

describe('Authentication Middleware', () => {
    describe('authenticate', () => {
        it('should successfully verify valid JWT token', async () => {
            // Arrange
            const mockRequest = {
                jwtVerify: jest.fn().mockResolvedValue(undefined),
            } as unknown as FastifyRequest;

            // Act & Assert
            await expect(authenticate(mockRequest)).resolves.not.toThrow();
            expect(mockRequest.jwtVerify).toHaveBeenCalled();
        });

        it('should throw UnauthorizedError when token is invalid', async () => {
            // Arrange
            const mockRequest = {
                jwtVerify: jest.fn().mockRejectedValue(new Error('Invalid token')),
            } as unknown as FastifyRequest;

            // Act & Assert
            await expect(authenticate(mockRequest)).rejects.toThrow(UnauthorizedError);
            await expect(authenticate(mockRequest)).rejects.toThrow(
                'Invalid or missing authentication token'
            );
        });

        it('should throw UnauthorizedError when token is missing', async () => {
            // Arrange
            const mockRequest = {
                jwtVerify: jest.fn().mockRejectedValue(new Error('No Authorization was found')),
            } as unknown as FastifyRequest;

            // Act & Assert
            await expect(authenticate(mockRequest)).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('authorize', () => {
        it('should allow access when user has required role', async () => {
            // Arrange
            const mockRequest = {
                user: {
                    id: '123',
                    email: 'admin@scpadel.com',
                    role: 'ADMIN' as Role,
                },
            } as unknown as FastifyRequest;

            const middleware = authorize(['ADMIN'] as Role[]);

            // Act & Assert
            await expect(middleware(mockRequest)).resolves.not.toThrow();
        });

        it('should throw ForbiddenError when user does not have required role', async () => {
            // Arrange
            const mockRequest = {
                user: {
                    id: '123',
                    email: 'player@scpadel.com',
                    role: 'PLAYER' as Role,
                },
            } as unknown as FastifyRequest;

            const middleware = authorize(['ADMIN'] as Role[]);

            // Act & Assert
            await expect(middleware(mockRequest)).rejects.toThrow(ForbiddenError);
            await expect(middleware(mockRequest)).rejects.toThrow(
                'You do not have permission to access this resource'
            );
        });

        it('should throw ForbiddenError when user is not authenticated', async () => {
            // Arrange
            const mockRequest = {
                user: undefined,
            } as unknown as FastifyRequest;

            const middleware = authorize(['ADMIN'] as Role[]);

            // Act & Assert
            await expect(middleware(mockRequest)).rejects.toThrow(ForbiddenError);
        });

        it('should allow access when user has one of multiple allowed roles', async () => {
            // Arrange
            const mockRequest = {
                user: {
                    id: '123',
                    email: 'player@scpadel.com',
                    role: 'PLAYER' as Role,
                },
            } as unknown as FastifyRequest;

            const middleware = authorize(['ADMIN', 'PLAYER'] as Role[]);

            // Act & Assert
            await expect(middleware(mockRequest)).resolves.not.toThrow();
        });
    });
});
