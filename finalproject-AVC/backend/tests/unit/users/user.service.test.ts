import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserService } from '../../../src/modules/users/user.service';
import { ConflictError } from '../../../src/shared/errors/app-error';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
        Role: {
            PLAYER: 'PLAYER',
            ADMIN: 'ADMIN',
        },
    };
});

// Mock bcrypt
jest.mock('bcrypt');

describe('UserService', () => {
    let userService: UserService;
    let prisma: any;

    beforeEach(() => {
        userService = new UserService();
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        const mockCreatedUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'newuser@scpadel.com',
            passwordHash: '$2b$10$hashedpassword',
            role: 'PLAYER' as Role,
            active: true,
            createdAt: new Date(),
        };

        it('should create a new user with PLAYER role successfully', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
            prisma.user.create.mockResolvedValue(mockCreatedUser);

            // Act
            const result = await userService.createUser('newuser@scpadel.com', 'password123', 'PLAYER' as Role);

            // Assert
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'newuser@scpadel.com' },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'newuser@scpadel.com',
                    passwordHash: '$2b$10$hashedpassword',
                    role: 'PLAYER',
                    active: true,
                },
            });
            expect(result).toEqual({
                id: mockCreatedUser.id,
                email: mockCreatedUser.email,
                role: mockCreatedUser.role,
                active: mockCreatedUser.active,
                createdAt: mockCreatedUser.createdAt,
            });
            expect(result).not.toHaveProperty('passwordHash');
        });

        it('should create a new user with ADMIN role successfully', async () => {
            // Arrange
            const adminUser = { ...mockCreatedUser, role: 'ADMIN' as Role };
            prisma.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
            prisma.user.create.mockResolvedValue(adminUser);

            // Act
            const result = await userService.createUser('admin@scpadel.com', 'admin123', 'ADMIN' as Role);

            // Assert
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'admin@scpadel.com',
                    passwordHash: '$2b$10$hashedpassword',
                    role: 'ADMIN',
                    active: true,
                },
            });
            expect(result.role).toBe('ADMIN');
        });

        it('should hash password before storing', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
            prisma.user.create.mockResolvedValue(mockCreatedUser);

            // Act
            await userService.createUser('newuser@scpadel.com', 'plainpassword', 'PLAYER' as Role);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
            expect(prisma.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        passwordHash: '$2b$10$hashedpassword',
                    }),
                })
            );
        });

        it('should throw ConflictError when email already exists', async () => {
            // Arrange
            const existingUser = {
                id: 'existing-id',
                email: 'existing@scpadel.com',
                passwordHash: '$2b$10$hash',
                role: 'PLAYER' as Role,
                active: true,
                createdAt: new Date(),
            };
            prisma.user.findUnique.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(
                userService.createUser('existing@scpadel.com', 'password123', 'PLAYER' as Role)
            ).rejects.toThrow(ConflictError);
            await expect(
                userService.createUser('existing@scpadel.com', 'password123', 'PLAYER' as Role)
            ).rejects.toThrow('User with this email already exists');

            // Verify user creation was not attempted
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it('should return user without password hash', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
            prisma.user.create.mockResolvedValue(mockCreatedUser);

            // Act
            const result = await userService.createUser('newuser@scpadel.com', 'password123', 'PLAYER' as Role);

            // Assert
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('role');
            expect(result).toHaveProperty('active');
            expect(result).toHaveProperty('createdAt');
        });
    });
});
