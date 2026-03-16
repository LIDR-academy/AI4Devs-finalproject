import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../../src/app';

const prisma = new PrismaClient();

describe('Profile Integration Tests', () => {
  let authToken: string;
  let profileId: string;

  beforeAll(async () => {
    // Clean up database
    await prisma.profile.deleteMany();
    
    // Create auth token for testing
    authToken = 'Bearer demo-token-123456';
  });

  afterAll(async () => {
    // Clean up
    await prisma.profile.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/profile - Create Profile', () => {
    it('should create a new profile successfully', async () => {
      const profileData = {
        username: 'test_user',
        companyName: 'Test Company',
        description: 'This is a test company description for testing purposes',
        phoneNumber: '+39 123 456 7890',
        email: 'test@example.com',
        openingTime: 'Monday-Friday: 9:00-18:00',
        address: 'Via Test 123, 00100 Roma, Italy',
        sector: 'Technology',
        website: 'https://www.test.com',
        logoUrl: 'https://www.test.com/logo.png'
      };

      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', authToken)
        .send(profileData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Profile created successfully');
      expect(response.body.profile).toHaveProperty('id');
      expect(response.body.profile).toHaveProperty('username', profileData.username);
      expect(response.body.profile).toHaveProperty('companyName', profileData.companyName);
      expect(response.body.profile).toHaveProperty('email', profileData.email);

      // Store profile ID for later tests
      profileId = response.body.profile.id;
    });

    it('should validate required fields', async () => {
      const invalidData = {
        username: 'te', // Too short
        companyName: '', // Empty
        description: 'short', // Too short
        phoneNumber: '123', // Too short
        email: 'invalid-email', // Invalid format
        openingTime: '9am', // Too short
        address: 'short', // Too short
        sector: 'T' // Too short
      };

      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', authToken)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should prevent duplicate usernames', async () => {
      const profileData = {
        username: 'test_user', // Same as previous test
        companyName: 'Another Company',
        description: 'This is another test company description for testing purposes',
        phoneNumber: '+39 987 654 3210',
        email: 'another@example.com',
        openingTime: 'Monday-Friday: 8:00-17:00',
        address: 'Via Another 456, 00200 Roma, Italy',
        sector: 'Commerce'
      };

      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', authToken)
        .send(profileData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username already exists');
    });
  });

  describe('GET /api/profile - Get Profile', () => {
    it('should get the first profile', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'test_user');
      expect(response.body).toHaveProperty('companyName', 'Test Company');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });
  });

  describe('GET /api/profile/:id - Get Profile by ID', () => {
    it('should get profile by ID', async () => {
      const response = await request(app)
        .get(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('id', profileId);
      expect(response.body).toHaveProperty('username', 'test_user');
    });

    it('should return 404 for non-existent profile', async () => {
      const response = await request(app)
        .get('/api/profile/non-existent-id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Profile not found');
    });
  });

  describe('PUT /api/profile/:id - Update Profile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        companyName: 'Updated Test Company',
        description: 'This is an updated test company description for testing purposes',
        email: 'updated@example.com',
        website: 'https://www.updated-test.com',
        phoneNumber: '+39 111 222 3333'
      };

      const response = await request(app)
        .put(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.profile).toHaveProperty('companyName', updateData.companyName);
      expect(response.body.profile).toHaveProperty('description', updateData.description);
      expect(response.body.profile).toHaveProperty('email', updateData.email);
      expect(response.body.profile).toHaveProperty('website', updateData.website);
      expect(response.body.profile).toHaveProperty('phoneNumber', updateData.phoneNumber);

      // Verify the update persisted
      const getResponse = await request(app)
        .get(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(getResponse.body).toHaveProperty('companyName', updateData.companyName);
      expect(getResponse.body).toHaveProperty('email', updateData.email);
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        companyName: '', // Empty
        email: 'invalid-email', // Invalid format
        website: 'not-a-url', // Invalid URL
        phoneNumber: '123' // Too short
      };

      const response = await request(app)
        .put(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 404 for non-existent profile', async () => {
      const updateData = {
        companyName: 'Test Update'
      };

      const response = await request(app)
        .put('/api/profile/non-existent-id')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Profile not found');
    });

    it('should require at least one field to update', async () => {
      const response = await request(app)
        .put(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .send({}) // Empty update
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
    });
  });

  describe('DELETE /api/profile/:id - Delete Profile', () => {
    it('should delete profile successfully', async () => {
      const response = await request(app)
        .delete(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile deleted successfully');

      // Verify profile is deleted
      const getResponse = await request(app)
        .get(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(getResponse.body).toHaveProperty('error', 'Profile not found');
    });

    it('should return 404 for non-existent profile', async () => {
      const response = await request(app)
        .delete('/api/profile/non-existent-id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Profile not found');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(async () => {
      // Create a fresh profile for each test
      const profileData = {
        username: 'edge_test_user',
        companyName: 'Edge Test Company',
        description: 'This is an edge test company description for testing purposes',
        phoneNumber: '+39 555 666 7777',
        email: 'edge@example.com',
        openingTime: 'Monday-Friday: 10:00-19:00',
        address: 'Via Edge 789, 00300 Roma, Italy',
        sector: 'Testing'
      };

      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', authToken)
        .send(profileData);

      profileId = response.body.profile.id;
    });

    afterEach(async () => {
      // Clean up after each test
      try {
        await request(app)
          .delete(`/api/profile/${profileId}`)
          .set('Authorization', authToken);
      } catch (error) {
        // Ignore errors if profile already deleted
      }
    });

    it('should handle partial updates correctly', async () => {
      const partialUpdate = {
        companyName: 'Partially Updated Company'
      };

      const response = await request(app)
        .put(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.profile).toHaveProperty('companyName', partialUpdate.companyName);
      // Other fields should remain unchanged
      expect(response.body.profile).toHaveProperty('email', 'edge@example.com');
      expect(response.body.profile).toHaveProperty('sector', 'Testing');
    });

    it('should handle optional fields correctly', async () => {
      const updateWithOptionals = {
        companyName: 'Company with Optionals',
        logoUrl: '', // Empty string should be converted to undefined
        website: '' // Empty string should be converted to undefined
      };

      const response = await request(app)
        .put(`/api/profile/${profileId}`)
        .set('Authorization', authToken)
        .send(updateWithOptionals)
        .expect(200);

      expect(response.body.profile).toHaveProperty('companyName', updateWithOptionals.companyName);
      // Empty strings should be handled properly
    });
  });
}); 