import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UnauthorizedError } from '../../../src/shared/errors/app-error';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
    let authService: AuthService;
    let prisma: any;

    beforeEach(() => {
        authService = new AuthService();
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('login', () => {
        const mockUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@scpadel.com',
            passwordHash: '$2b$10$hashedpassword',
            role: 'PLAYER' as const,
            active: true,
            createdAt: new Date(),
        };

        it('should return user without password hash when credentials are valid', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Act
            const result = await authService.login('test@scpadel.com', 'password123');

            // Assert
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@scpadel.com' },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.passwordHash);
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                active: mockUser.active,
                createdAt: mockUser.createdAt,
            });
            expect(result).not.toHaveProperty('passwordHash');
        });

        it('should throw UnauthorizedError when user does not exist', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(authService.login('nonexistent@scpadel.com', 'password123')).rejects.toThrow(
                UnauthorizedError
            );
            await expect(authService.login('nonexistent@scpadel.com', 'password123')).rejects.toThrow(
                'Invalid credentials'
            );
        });

        it('should throw UnauthorizedError when password is invalid', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(authService.login('test@scpadel.com', 'wrongpassword')).rejects.toThrow(
                UnauthorizedError
            );
            await expect(authService.login('test@scpadel.com', 'wrongpassword')).rejects.toThrow(
                'Invalid credentials'
            );
        });

        it('should throw UnauthorizedError when user is inactive', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, active: false };
            prisma.user.findUnique.mockResolvedValue(inactiveUser);

            // Act & Assert
            await expect(authService.login('test@scpadel.com', 'password123')).rejects.toThrow(
                UnauthorizedError
            );
            await expect(authService.login('test@scpadel.com', 'password123')).rejects.toThrow(
                'User account is inactive'
            );
        });
    });
});
