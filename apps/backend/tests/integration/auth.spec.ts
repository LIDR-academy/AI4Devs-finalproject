import request from 'supertest';
import app from '../../src/app';
import { createRegisterUserDto, createLoginUserDto } from '../factories/user.factory';
import { prisma } from '@/infrastructure/database/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

// Mocking Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth Integration', () => {
  const registerUrl = '/api/auth/register';
  const loginUrl = '/api/auth/login';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should return 201 Created given valid data', async () => {
      // Arrange
      const userData = createRegisterUserDto();
      // Mock: No user exists with this email
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      // Mock: Create returns the user with an ID
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id-123',
        ...userData,
        passwordHash: 'hashed_password', // In reality it will be hashed
        role: 'CLIENT',
        subscriptionTier: 'FREE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const response = await request(app).post(registerUrl).send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'user-id-123');
      expect(response.body).toHaveProperty('email', userData.email);
    });

    it('should return 400 Bad Request given invalid data', async () => {
        // Arrange
        const invalidData = createRegisterUserDto({ email: 'invalid-email' });
  
        // Act
        const response = await request(app).post(registerUrl).send(invalidData);
  
        // Assert
        expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 OK and a token given valid credentials', async () => {
      // Arrange
      const loginData = createLoginUserDto();
      // We need a real hash comparison to pass if we don't mock bcrypt.
      // So let's generate a real hash for the mock.
      const hashedPassword = await bcrypt.hash(loginData.password, 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id-123',
        email: loginData.email,
        passwordHash: hashedPassword,
        fullName: 'Test User',
        role: 'CLIENT',
        subscriptionTier: 'FREE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const response = await request(app).post(loginUrl).send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('should return 401 Unauthorized given wrong password', async () => {
      // Arrange
      const loginData = createLoginUserDto({ password: 'WrongPassword' });
       // Logic: User exists but password mismatch
       const correctPasswordHash = await bcrypt.hash('CorrectPassword', 10);

       (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id-123',
        email: loginData.email,
        passwordHash: correctPasswordHash,
        fullName: 'Test User',
        role: 'CLIENT',
        subscriptionTier: 'FREE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const response = await request(app).post(loginUrl).send(loginData);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 200 and user info given valid token', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      const token = jwt.sign({ userId, email: 'test@example.com', role: 'CLIENT' }, env.JWT_SECRET, { expiresIn: '1h' });
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'CLIENT',
        subscriptionTier: 'FREE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock findById (via findUnique)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });
  });
});
