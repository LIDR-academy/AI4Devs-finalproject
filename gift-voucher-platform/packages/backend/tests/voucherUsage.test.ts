import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { VoucherUsage } from '../src/domain/models/VoucherUsage';
import { 
  createTestUser, 
  createTestAdmin, 
  createTestStoreManager,
  createTestStore,
  createTestProduct,
  createTestVoucher,
  createTestVoucherUsage,
  generateToken, 
  getAuthHeader 
} from './helpers';

// Import test setup
import './setup';

describe('VoucherUsage API', () => {
  describe('POST /api/voucher-usages', () => {
    it('should create a new voucher usage for store manager', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const usageData = {
        voucherId: (voucher._id as mongoose.Types.ObjectId).toString(),
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        customerId: (customer._id as mongoose.Types.ObjectId).toString()
      };

      const response = await request(app)
        .post('/api/voucher-usages')
        .set(getAuthHeader(token))
        .send(usageData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.voucherId).toBe((voucher._id as mongoose.Types.ObjectId).toString());
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      expect(response.body).toHaveProperty('usedAt');
    });

    it('should allow admin to create a voucher usage', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const usageData = {
        voucherId: (voucher._id as mongoose.Types.ObjectId).toString(),
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        customerId: (customer._id as mongoose.Types.ObjectId).toString()
      };

      const response = await request(app)
        .post('/api/voucher-usages')
        .set(getAuthHeader(token))
        .send(usageData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.voucherId).toBe((voucher._id as mongoose.Types.ObjectId).toString());
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
    });

    it('should not allow regular customers to create a voucher usage', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const usageData = {
        voucherId: (voucher._id as mongoose.Types.ObjectId).toString(),
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        customerId: (customer._id as mongoose.Types.ObjectId).toString()
      };

      const response = await request(app)
        .post('/api/voucher-usages')
        .set(getAuthHeader(token))
        .send(usageData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should not allow store manager to create a voucher usage for another store', async () => {
      // Create first store manager and store
      const storeManager1 = await createTestStoreManager();
      const store1 = await createTestStore(storeManager1._id as mongoose.Types.ObjectId);
      
      // Create second store manager and store
      const storeManager2 = await createTestStoreManager();
      const store2 = await createTestStore(storeManager2._id as mongoose.Types.ObjectId);
      const product2 = await createTestProduct(store2._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store2._id as mongoose.Types.ObjectId,
        product2._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Use token from first store manager
      const token = generateToken(storeManager1._id as mongoose.Types.ObjectId, 'store_manager');

      const usageData = {
        voucherId: (voucher._id as mongoose.Types.ObjectId).toString(),
        storeId: (store2._id as mongoose.Types.ObjectId).toString(), // Trying to create for store2
        customerId: (customer._id as mongoose.Types.ObjectId).toString()
      };

      const response = await request(app)
        .post('/api/voucher-usages')
        .set(getAuthHeader(token))
        .send(usageData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should not create a voucher usage with invalid data', async () => {
      // Create a store manager
      const storeManager = await createTestStoreManager();
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const invalidUsageData = {
        voucherId: new mongoose.Types.ObjectId().toString(), // Non-existent voucher
        storeId: new mongoose.Types.ObjectId().toString(), // Non-existent store
        customerId: new mongoose.Types.ObjectId().toString() // Non-existent customer
      };

      const response = await request(app)
        .post('/api/voucher-usages')
        .set(getAuthHeader(token))
        .send(invalidUsageData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/voucher-usages', () => {
    it('should return all voucher usages for admin', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create some test voucher usages
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get('/api/voucher-usages')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should not allow non-admin users to get all voucher usages', async () => {
      // Create a regular customer
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get('/api/voucher-usages')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('GET /api/voucher-usages/:id', () => {
    it('should return a voucher usage by ID for admin', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create a voucher usage
      const voucherUsage = await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get(`/api/voucher-usages/${voucherUsage._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(voucherUsage._id.toString());
      expect(response.body.voucherId).toBe((voucher._id as mongoose.Types.ObjectId).toString());
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
    });

    it('should allow store manager to access voucher usages for their store', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create a voucher usage
      const voucherUsage = await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the store manager
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .get(`/api/voucher-usages/${voucherUsage._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(voucherUsage._id.toString());
    });

    it('should allow customer to access their own voucher usages', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create a voucher usage
      const voucherUsage = await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/voucher-usages/${voucherUsage._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(voucherUsage._id.toString());
    });

    it('should not allow a user to access another user\'s voucher usage', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer1 = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer1._id as mongoose.Types.ObjectId
      );
      
      // Create a voucher usage for customer1
      const voucherUsage = await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer1._id as mongoose.Types.ObjectId
      );
      
      // Create another customer
      const customer2 = await createTestUser({
        name: 'Another Customer',
        email: 'another@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(customer2._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/voucher-usages/${voucherUsage._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should return 404 for non-existent voucher usage', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/voucher-usages/${nonExistentId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/voucher-usages/voucher/:voucherId', () => {
    it('should return voucher usages for a specific voucher', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create voucher usages for this voucher
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get(`/api/voucher-usages/voucher/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned voucher usages belong to the voucher
      response.body.forEach((usage: any) => {
        expect(usage.voucherId).toBe((voucher._id as mongoose.Types.ObjectId).toString());
      });
    });
  });

  describe('GET /api/voucher-usages/store/:storeId', () => {
    it('should return voucher usages for a specific store', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create voucher usages for this store
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the store manager
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .get(`/api/voucher-usages/store/${store._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned voucher usages belong to the store
      response.body.forEach((usage: any) => {
        expect(usage.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      });
    });

    it('should not allow a store manager to get voucher usages for another store', async () => {
      // Create first store manager and store
      const storeManager1 = await createTestStoreManager();
      const store1 = await createTestStore(storeManager1._id as mongoose.Types.ObjectId);
      
      // Create second store manager and store
      const storeManager2 = await createTestStoreManager();
      const store2 = await createTestStore(storeManager2._id as mongoose.Types.ObjectId);
      const product2 = await createTestProduct(store2._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store2._id as mongoose.Types.ObjectId,
        product2._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create voucher usages for store2
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store2._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Use token from first store manager
      const token = generateToken(storeManager1._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .get(`/api/voucher-usages/store/${store2._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('GET /api/voucher-usages/customer/:customerId', () => {
    it('should return voucher usages for a specific customer', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create voucher usages for this customer
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/voucher-usages/customer/${customer._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned voucher usages belong to the customer
      response.body.forEach((usage: any) => {
        expect(usage.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      });
    });

    it('should not allow a customer to get voucher usages for another customer', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer1 = await createTestUser();
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer1._id as mongoose.Types.ObjectId
      );
      
      // Create voucher usages for customer1
      await createTestVoucherUsage(
        voucher._id as mongoose.Types.ObjectId,
        store._id as mongoose.Types.ObjectId,
        customer1._id as mongoose.Types.ObjectId
      );
      
      // Create another customer
      const customer2 = await createTestUser({
        name: 'Another Customer',
        email: 'another@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(customer2._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/voucher-usages/customer/${customer1._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });
}); 