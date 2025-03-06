import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/domain/models/User';
import { 
  createTestUser, 
  createTestAdmin, 
  generateToken, 
  getAuthHeader 
} from './helpers';

// Import test setup
import './setup';

describe('User API', () => {
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should not create a user with an existing email', async () => {
      // Create a user first
      await createTestUser();

      // Try to create another user with the same email
      const userData = {
        name: 'Duplicate User',
        email: 'test@example.com', // Same email as in createTestUser
        password: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User with this email already exists');
    });

    it('should not create a user with invalid data', async () => {
      const invalidUserData = {
        name: 'Invalid User',
        email: 'not-an-email',
        password: '123', // Too short
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      // Create an admin user
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      // Create some test users
      await createTestUser({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'password123',
        role: 'customer'
      });
      await createTestUser({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        role: 'customer'
      });

      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3); // Admin + 2 users
    });

    it('should not allow non-admin users to get all users', async () => {
      // Create a regular user
      const user = await createTestUser();
      const token = generateToken(user._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      // Create a test user
      const user = await createTestUser();
      const token = generateToken(user._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data._id).toBe((user._id as mongoose.Types.ObjectId).toString());
      expect(response.body.data.name).toBe(user.name);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should allow admin to access any user', async () => {
      // Create an admin and a regular user
      const admin = await createTestAdmin();
      const user = await createTestUser({
        name: 'Regular User',
        email: 'regular@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data._id).toBe((user._id as mongoose.Types.ObjectId).toString());
      expect(response.body.data.name).toBe(user.name);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should not allow a user to access another user', async () => {
      // Create two regular users
      const user1 = await createTestUser();
      const user2 = await createTestUser({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(user1._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/users/${user2._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });

    it('should return 404 for non-existent user', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      // Create a test user
      const user = await createTestUser();
      const token = generateToken(user._id as mongoose.Types.ObjectId, 'customer');

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.role).toBe(user.role);
    });

    it('should allow admin to update any user', async () => {
      // Create an admin and a regular user
      const admin = await createTestAdmin();
      const user = await createTestUser({
        name: 'Regular User',
        email: 'regular@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const updateData = {
        name: 'Admin Updated',
        role: 'store_manager' // Admin can change roles
      };

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.role).toBe(updateData.role);
    });

    it('should not allow a user to update another user', async () => {
      // Create two regular users
      const user1 = await createTestUser();
      const user2 = await createTestUser({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(user1._id as mongoose.Types.ObjectId, 'customer');

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/users/${user2._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });

    it('should not allow regular users to change their role', async () => {
      // Create a test user
      const user = await createTestUser();
      const token = generateToken(user._id as mongoose.Types.ObjectId, 'customer');

      const updateData = {
        name: 'Role Changer',
        role: 'admin' // Trying to become admin
      };

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized to change role');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete any user', async () => {
      // Create an admin and a regular user
      const admin = await createTestAdmin();
      const user = await createTestUser({
        name: 'User to Delete',
        email: 'delete@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should allow users to delete their own account', async () => {
      // Create a test user
      const user = await createTestUser();
      const token = generateToken(user._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should not allow a user to delete another user', async () => {
      // Create two regular users
      const user1 = await createTestUser();
      const user2 = await createTestUser({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(user1._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .delete(`/api/users/${user2._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');

      // Verify user2 is not deleted
      const notDeletedUser = await User.findById(user2._id);
      expect(notDeletedUser).not.toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/users/${nonExistentId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login a user with valid credentials', async () => {
      // Create a test user
      const password = 'password123';
      const user = await createTestUser({ 
        name: 'Login User', 
        email: 'login@example.com', 
        password, 
        role: 'customer' 
      });

      const loginData = {
        email: user.email,
        password
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user._id.toString());
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User not found');
    });

    it('should not login with invalid password', async () => {
      // Create a test user
      const user = await createTestUser();

      const loginData = {
        email: user.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });
  });
}); 