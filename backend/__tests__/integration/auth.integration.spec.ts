import { expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';

// MVP Test User - aligns with actual seeded data in user service
const testUser = {
  email: 'test@example.com',
  password: 'ShopMefy2024',
  firstName: 'Test',
  lastName: 'User'
};

describe('Auth API Integration Tests - MVP Scope', () => {
  describe('POST /api/auth/login', () => {
    it('should authenticate user with valid credentials (MVP: demo token)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      // MVP: Token is demo format, not JWT
      expect(response.body.token).toMatch(/^demo-token-\d+$/);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@email.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
          // Missing password
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register new user (MVP: basic registration)', async () => {
      const newUser = {
        email: 'newuser@test.com',
        password: 'ShopMefy2024',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.message).toBe('User registered successfully');
      
      // MVP: Registration doesn't return token, only user
      expect(response.body.user.email).toBe(newUser.email);
    });

    it('should reject duplicate email registration', async () => {
      // First register a user
      const newUser = {
        email: 'duplicate@test.com',
        password: 'ShopMefy2024',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(newUser);

      // Try to register the same email again
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // MVP Note: No protected routes testing since JWT validation is not implemented
  // Profile endpoint and protected routes are planned for Phase 2
}); // test
