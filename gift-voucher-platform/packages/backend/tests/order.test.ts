import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Order } from '../src/domain/models/Order';
import { 
  createTestUser, 
  createTestAdmin, 
  createTestStoreManager,
  createTestStore,
  createTestProduct,
  createTestVoucher,
  createTestOrder,
  generateToken, 
  getAuthHeader 
} from './helpers';

// Import test setup
import './setup';

describe('Order API', () => {
  describe('POST /api/orders', () => {
    it('should create a new order for a customer', async () => {
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

      const orderData = {
        customerId: (customer._id as mongoose.Types.ObjectId).toString(),
        voucherId: (voucher._id as mongoose.Types.ObjectId).toString(),
        paymentDetails: {
          paymentId: 'TEST-PAYMENT-123',
          paymentStatus: 'completed',
          paymentEmail: 'customer@example.com',
          amount: 99.99,
          provider: 'test_provider'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeader(token))
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      expect(response.body.voucherId).toBe((voucher._id as mongoose.Types.ObjectId).toString());
      expect(response.body.paymentDetails.paymentStatus).toBe('completed');
    });

    it('should allow admin to create an order for any customer', async () => {
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

      const orderData = {
        customerId: (customer._id as mongoose.Types.ObjectId).toString(),
        voucherId: (voucher._id as mongoose.Types.ObjectId).toString(),
        paymentDetails: {
          paymentId: 'ADMIN-PAYMENT-123',
          paymentStatus: 'completed',
          paymentEmail: 'admin@example.com',
          amount: 149.99,
          provider: 'test_provider'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeader(token))
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      expect(response.body.voucherId).toBe((voucher._id as mongoose.Types.ObjectId).toString());
    });

    it('should not allow a user to create an order for another user', async () => {
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
      const voucher = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer2._id as mongoose.Types.ObjectId
      );
      const token = generateToken(customer1._id as mongoose.Types.ObjectId, 'customer');

      const orderData = {
        customerId: (customer2._id as mongoose.Types.ObjectId).toString(), // Trying to create for another customer
        voucherId: (voucher._id as mongoose.Types.ObjectId).toString(),
        paymentDetails: {
          paymentId: 'UNAUTHORIZED-PAYMENT-123',
          paymentStatus: 'completed',
          paymentEmail: 'unauthorized@example.com',
          amount: 59.99,
          provider: 'test_provider'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeader(token))
        .send(orderData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should not create an order with invalid data', async () => {
      // Create a customer
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const invalidOrderData = {
        customerId: (customer._id as mongoose.Types.ObjectId).toString(),
        voucherId: new mongoose.Types.ObjectId().toString(), // Non-existent voucher
        paymentDetails: {
          paymentId: '',
          paymentStatus: 'invalid-status',
          paymentEmail: 'not-an-email',
          amount: -10, // Negative amount
          provider: ''
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set(getAuthHeader(token))
        .send(invalidOrderData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/orders', () => {
    it('should return all orders for admin', async () => {
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
      
      // Create some test orders
      await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get('/api/orders')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should not allow non-admin users to get all orders', async () => {
      // Create a regular customer
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get('/api/orders')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return an order by ID for its owner', async () => {
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
      
      // Create an order
      const order = await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(order._id.toString());
      expect(response.body.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      expect(response.body.voucherId).toBe((voucher._id as mongoose.Types.ObjectId).toString());
    });

    it('should allow admin to access any order', async () => {
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
      
      // Create an order
      const order = await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(order._id.toString());
    });

    it('should not allow a user to access another user\'s order', async () => {
      // Create a store manager, store, product, and two customers
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer1 = await createTestUser();
      const voucher1 = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer1._id as mongoose.Types.ObjectId
      );
      
      // Create an order for customer1
      const order = await createTestOrder(
        customer1._id as mongoose.Types.ObjectId,
        voucher1._id as mongoose.Types.ObjectId
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
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should return 404 for non-existent order', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/orders/${nonExistentId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/orders/customer/:customerId', () => {
    it('should return orders for a customer', async () => {
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
      
      // Create orders for this customer
      await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .get(`/api/orders/customer/${customer._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned orders belong to the customer
      response.body.forEach((order: any) => {
        expect(order.customerId).toBe((customer._id as mongoose.Types.ObjectId).toString());
      });
    });

    it('should allow admin to get orders for any customer', async () => {
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
      
      // Create an order for this customer
      await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .get(`/api/orders/customer/${customer._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should not allow a user to get another user\'s orders', async () => {
      // Create a store manager, store, product, and two customers
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const customer1 = await createTestUser();
      const voucher1 = await createTestVoucher(
        store._id as mongoose.Types.ObjectId,
        product._id as mongoose.Types.ObjectId,
        customer1._id as mongoose.Types.ObjectId
      );
      
      // Create an order for customer1
      await createTestOrder(
        customer1._id as mongoose.Types.ObjectId,
        voucher1._id as mongoose.Types.ObjectId
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
        .get(`/api/orders/customer/${customer1._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should allow admin to update an order', async () => {
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
      
      // Create an order
      const order = await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const updateData = {
        paymentDetails: {
          paymentStatus: 'refunded',
          paymentId: 'REFUND-123'
        }
      };

      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.paymentDetails.paymentStatus).toBe(updateData.paymentDetails.paymentStatus);
      expect(response.body.paymentDetails.paymentId).toBe(updateData.paymentDetails.paymentId);
    });

    it('should not allow regular customers to update orders', async () => {
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
      
      // Create an order
      const order = await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const updateData = {
        paymentDetails: {
          paymentStatus: 'refunded'
        }
      };

      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should allow admin to delete any order', async () => {
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
      
      // Create an order
      const order = await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .delete(`/api/orders/${order._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify order is deleted
      const deletedOrder = await Order.findById(order._id);
      expect(deletedOrder).toBeNull();
    });

    it('should not allow regular customers to delete orders', async () => {
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
      
      // Create an order
      const order = await createTestOrder(
        customer._id as mongoose.Types.ObjectId,
        voucher._id as mongoose.Types.ObjectId
      );
      
      // Get token for the customer
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const response = await request(app)
        .delete(`/api/orders/${order._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');

      // Verify order is not deleted
      const notDeletedOrder = await Order.findById(order._id);
      expect(notDeletedOrder).not.toBeNull();
    });
  });
}); 