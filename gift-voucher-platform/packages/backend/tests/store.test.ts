import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Store } from '../src/domain/models/Store';
import { 
  createTestUser, 
  createTestAdmin, 
  createTestStoreManager,
  createTestStore,
  generateToken, 
  getAuthHeader 
} from './helpers';

// Import test setup
import './setup';

describe('Store API', () => {
  describe('POST /api/stores', () => {
    it('should create a new store for store manager', async () => {
      // Create a store manager
      const storeManager = await createTestStoreManager();
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const storeData = {
        name: 'New Test Store',
        email: 'newstore@example.com',
        phone: '+1234567890',
        address: '123 New Store St, Test City'
      };

      const response = await request(app)
        .post('/api/stores')
        .set(getAuthHeader(token))
        .send(storeData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(storeData.name);
      expect(response.body.data.email).toBe(storeData.email);
      expect(response.body.data.ownerId).toBe((storeManager._id as mongoose.Types.ObjectId).toString());
    });

    it('should allow admin to create a store', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const storeData = {
        name: 'Admin Created Store',
        email: 'adminstore@example.com',
        phone: '+1987654321',
        address: '456 Admin St, Test City',
        ownerId: (admin._id as mongoose.Types.ObjectId).toString()
      };

      const response = await request(app)
        .post('/api/stores')
        .set(getAuthHeader(token))
        .send(storeData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(storeData.name);
      expect(response.body.data.ownerId).toBe((admin._id as mongoose.Types.ObjectId).toString());
    });

    it('should not allow regular customers to create a store', async () => {
      // Create a regular customer
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const storeData = {
        name: 'Unauthorized Store',
        email: 'unauthorized@example.com',
        phone: '+1122334455',
        address: '789 Unauthorized St, Test City'
      };

      const response = await request(app)
        .post('/api/stores')
        .set(getAuthHeader(token))
        .send(storeData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });

    it('should not create a store with invalid data', async () => {
      // Create a store manager
      const storeManager = await createTestStoreManager();
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const invalidStoreData = {
        name: '', // Empty name
        email: 'not-an-email',
        phone: '123', // Invalid phone
        address: '' // Empty address
      };

      const response = await request(app)
        .post('/api/stores')
        .set(getAuthHeader(token))
        .send(invalidStoreData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/stores', () => {
    it('should return all stores', async () => {
      // Create a store manager
      const storeManager = await createTestStoreManager();
      
      // Create some test stores
      await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      await createTestStore(storeManager._id as mongoose.Types.ObjectId);

      const response = await request(app)
        .get('/api/stores');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/stores/:id', () => {
    it('should return a store by ID', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);

      const response = await request(app)
        .get(`/api/stores/${store._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data._id).toBe((store._id as mongoose.Types.ObjectId).toString());
      expect(response.body.data.name).toBe(store.name);
      expect(response.body.data.email).toBe(store.email);
    });

    it('should return 404 for non-existent store', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/stores/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Store not found');
    });
  });

  describe('GET /api/stores/owner/:ownerId', () => {
    it('should return stores by owner ID', async () => {
      // Create a store manager
      const storeManager = await createTestStoreManager();
      
      // Create stores for this manager
      await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      await createTestStore(storeManager._id as mongoose.Types.ObjectId);

      const response = await request(app)
        .get(`/api/stores/owner/${storeManager._id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned stores belong to the store manager
      response.body.forEach((store: any) => {
        expect(store.ownerId).toBe((storeManager._id as mongoose.Types.ObjectId).toString());
      });
    });

    it('should return empty array for owner with no stores', async () => {
      // Create a user with no stores
      const user = await createTestUser();

      const response = await request(app)
        .get(`/api/stores/owner/${user._id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/stores/:id', () => {
    it('should allow store owner to update their store', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const updateData = {
        name: 'Updated Store Name',
        email: 'updated@example.com',
        phone: '+1999888777',
        address: '999 Updated St, New City'
      };

      const response = await request(app)
        .put(`/api/stores/${store._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    it('should allow admin to update any store', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const updateData = {
        name: 'Admin Updated Store',
        email: 'adminupdated@example.com'
      };

      const response = await request(app)
        .put(`/api/stores/${store._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(updateData.email);
    });

    it('should not allow non-owner to update a store', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create another user
      const anotherUser = await createTestUser();
      const token = generateToken(anotherUser._id as mongoose.Types.ObjectId, 'customer');

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/stores/${store._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });

    it('should return 404 for non-existent store', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const updateData = {
        name: 'Non-existent Store Update'
      };

      const response = await request(app)
        .put(`/api/stores/${nonExistentId}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Store not found');
    });
  });

  describe('DELETE /api/stores/:id', () => {
    it('should allow store owner to delete their store', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .delete(`/api/stores/${store._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);

      // Verify store is deleted
      const deletedStore = await Store.findById(store._id);
      expect(deletedStore).toBeNull();
    });

    it('should allow admin to delete any store', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .delete(`/api/stores/${store._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);

      // Verify store is deleted
      const deletedStore = await Store.findById(store._id);
      expect(deletedStore).toBeNull();
    });

    it('should not allow non-owner to delete a store', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create another user
      const anotherUser = await createTestUser();
      const token = generateToken(anotherUser._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .delete(`/api/stores/${store._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');

      // Verify store is not deleted
      const notDeletedStore = await Store.findById(store._id);
      expect(notDeletedStore).not.toBeNull();
    });

    it('should return 404 for non-existent store', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/stores/${nonExistentId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Store not found');
    });
  });
}); 