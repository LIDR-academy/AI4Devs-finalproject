import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Voucher } from '../src/domain/models/Voucher';
import { 
  createTestUser, 
  createTestAdmin, 
  createTestStoreManager,
  createTestStore,
  createTestProduct,
  createTestVoucher,
  generateToken, 
  getAuthHeader 
} from './helpers';

// Import test setup
import './setup';

describe('Voucher API', () => {
  describe('POST /api/vouchers', () => {
    it('should create a new voucher for a customer', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const voucherData = {
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        productId: (product._id as mongoose.Types.ObjectId).toString(),
        customerId: (customer._id as mongoose.Types.ObjectId).toString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      const response = await request(app)
        .post('/api/vouchers')
        .set(getAuthHeader(token))
        .send(voucherData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      expect(response.body.productId).toBe((product._id as mongoose.Types.ObjectId).toString());
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      expect(response.body.status).toBe('active');
    });

    it('should allow admin to create a voucher for any customer', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const voucherData = {
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        productId: (product._id as mongoose.Types.ObjectId).toString(),
        customerId: (customer._id as mongoose.Types.ObjectId).toString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      const response = await request(app)
        .post('/api/vouchers')
        .set(getAuthHeader(token))
        .send(voucherData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      expect(response.body.productId).toBe((product._id as mongoose.Types.ObjectId).toString());
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
    });

    it('should not allow a user to create a voucher for another user', async () => {
      // Create a store manager, store, product, and two customers
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer1 = await createTestUser();
      const customer2 = await createTestUser({
        name: 'Another Customer',
        email: 'another@example.com',
        password: 'password123',
        role: 'customer'
      });
      const token = generateToken(customer1._id as mongoose.Types.ObjectId, 'customer');

      const voucherData = {
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        productId: (product._id as mongoose.Types.ObjectId).toString(),
        customerId: (customer2._id as mongoose.Types.ObjectId).toString(), // Trying to create for another customer
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/vouchers')
        .set(getAuthHeader(token))
        .send(voucherData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should not create a voucher with invalid data', async () => {
      // Create a customer
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const invalidVoucherData = {
        storeId: new mongoose.Types.ObjectId().toString(), // Non-existent store
        productId: new mongoose.Types.ObjectId().toString(), // Non-existent product
        customerId: (customer._id as mongoose.Types.ObjectId).toString(),
        expirationDate: new Date(Date.now() - 1000).toISOString() // Past date
      };

      const response = await request(app)
        .post('/api/vouchers')
        .set(getAuthHeader(token))
        .send(invalidVoucherData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/vouchers', () => {
    it('should return all vouchers for admin', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create some test vouchers
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get('/api/vouchers')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should not allow non-admin users to get all vouchers', async () => {
      // Create a regular customer
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get('/api/vouchers')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('GET /api/vouchers/:id', () => {
    it('should return a voucher by ID for its owner', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe((voucher._id as mongoose.Types.ObjectId).toString());
      expect(response.body.code).toBe(voucher.code);
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
    });

    it('should allow admin to access any voucher', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe((voucher._id as mongoose.Types.ObjectId).toString());
    });

    it('should allow store manager to access vouchers for their store', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the store manager
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .get(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe((voucher._id as mongoose.Types.ObjectId).toString());
    });

    it('should not allow a user to access another user\'s voucher', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer1 = await createTestUser();
      
      // Create a voucher for customer1
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
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
        .get(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should return 404 for non-existent voucher', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/vouchers/${nonExistentId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/vouchers/customer/:customerId', () => {
    it('should return vouchers for a customer', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create vouchers for this customer
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/vouchers/customer/${customer._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned vouchers belong to the customer
      response.body.forEach((voucher: any) => {
        expect(voucher.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      });
    });

    it('should allow admin to get vouchers for any customer', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create vouchers for this customer
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get(`/api/vouchers/customer/${customer._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should not allow a user to get another user\'s vouchers', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer1 = await createTestUser();
      
      // Create vouchers for customer1
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
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
        .get(`/api/vouchers/customer/${customer1._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('GET /api/vouchers/store/:storeId', () => {
    it('should return vouchers for a store manager', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create vouchers for this store
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the store manager
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .get(`/api/vouchers/store/${store._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned vouchers belong to the store
      response.body.forEach((voucher: any) => {
        expect(voucher.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      });
    });

    it('should not allow a store manager to get vouchers for another store', async () => {
      // Create first store manager and store
      const storeManager1 = await createTestStoreManager();
      const store1 = await createTestStore(storeManager1._id as mongoose.Types.ObjectId);
      
      // Create second store manager and store
      const storeManager2 = await createTestStoreManager();
      const store2 = await createTestStore(storeManager2._id as mongoose.Types.ObjectId);
      const product2 = await createTestProduct(store2._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create vouchers for store2
      await createTestVoucher(
        store2._id as mongoose.Types.ObjectId,
        product2._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Use token from first store manager
      const token = generateToken(storeManager1._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .get(`/api/vouchers/store/${store2._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('PUT /api/vouchers/:id', () => {
    it('should allow admin to update a voucher status', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const updateData = {
        status: 'redeemed'
      };

      const response = await request(app)
        .put(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.status).toBe(updateData.status);
    });

    it('should allow store manager to update vouchers for their store', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the store manager
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const updateData = {
        status: 'redeemed'
      };

      const response = await request(app)
        .put(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.status).toBe(updateData.status);
    });

    it('should not allow regular customers to update vouchers', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const updateData = {
        status: 'redeemed'
      };

      const response = await request(app)
        .put(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('DELETE /api/vouchers/:id', () => {
    it('should allow admin to delete any voucher', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .delete(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify voucher is deleted
      const deletedVoucher = await Voucher.findById(voucher._id);
      expect(deletedVoucher).toBeNull();
    });

    it('should not allow store managers to delete vouchers', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the store manager
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .delete(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');

      // Verify voucher is not deleted
      const notDeletedVoucher = await Voucher.findById(voucher._id);
      expect(notDeletedVoucher).not.toBeNull();
    });

    it('should not allow customers to delete vouchers', async () => {
      // Create a store manager, store, product, and customer
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer = await createTestUser();
      
      // Create a voucher
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .delete(`/api/vouchers/${voucher._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');

      // Verify voucher is not deleted
      const notDeletedVoucher = await Voucher.findById(voucher._id);
      expect(notDeletedVoucher).not.toBeNull();
    });
  });
}); 