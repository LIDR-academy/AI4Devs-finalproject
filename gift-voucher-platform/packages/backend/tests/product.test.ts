import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Product } from '../src/domain/models/Product';
import { 
  createTestUser, 
  createTestAdmin, 
  createTestStoreManager,
  createTestStore,
  createTestProduct,
  generateToken, 
  getAuthHeader 
} from './helpers';

// Import test setup
import './setup';

describe('Product API', () => {
  describe('POST /api/products', () => {
    it('should create a new product for store owner', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');
      const productData = {
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        name: 'New Test Product',
        description: 'This is a test product description',
        price: 99.99,
        isActive: true
      };

      const response = await request(app)
        .post('/api/products')
        .set(getAuthHeader(token))
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price);
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
    });

    it('should allow admin to create a product for any store', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const productData = {
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        name: 'Admin Created Product',
        description: 'This product was created by an admin',
        price: 149.99,
        isActive: true
      };

      const response = await request(app)
        .post('/api/products')
        .set(getAuthHeader(token))
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
    });

    it('should not allow regular customers to create a product', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create a regular customer
      const customer = await createTestUser();
      const token = generateToken(customer._id as mongoose.Types.ObjectId, 'customer');

      const productData = {
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        name: 'Unauthorized Product',
        description: 'This product should not be created',
        price: 59.99,
        isActive: true
      };

      const response = await request(app)
        .post('/api/products')
        .set(getAuthHeader(token))
        .send(productData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should not allow store manager to create a product for another store', async () => {
      // Create first store manager and store
      const storeManager1 = await createTestStoreManager();
      const store1 = await createTestStore(storeManager1._id as mongoose.Types.ObjectId);
      
      // Create second store manager and store
      const storeManager2 = await createTestStoreManager();
      const store2 = await createTestStore(storeManager2._id as mongoose.Types.ObjectId);
      
      // Use token from first store manager
      const token = generateToken(storeManager1._id as mongoose.Types.ObjectId, 'store_manager');

      const productData = {
        storeId: (store2._id as mongoose.Types.ObjectId).toString(), // Trying to create for store2
        name: 'Cross-Store Product',
        description: 'This product should not be created',
        price: 79.99,
        isActive: true
      };

      const response = await request(app)
        .post('/api/products')
        .set(getAuthHeader(token))
        .send(productData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should not create a product with invalid data', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const invalidProductData = {
        storeId: (store._id as mongoose.Types.ObjectId).toString(),
        name: '', // Empty name
        description: 'Invalid product',
        price: -10, // Negative price
        isActive: true
      };

      const response = await request(app)
        .post('/api/products')
        .set(getAuthHeader(token))
        .send(invalidProductData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create some test products
      await createTestProduct(store._id as mongoose.Types.ObjectId);
      await createTestProduct(store._id as mongoose.Types.ObjectId);

      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by ID', async () => {
      // Create a store manager, store, and product
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);

      const response = await request(app)
        .get(`/api/products/${product._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe((product._id as mongoose.Types.ObjectId).toString());
      expect(response.body.name).toBe(product.name);
      expect(response.body.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
    });

    it('should return 404 for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/products/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/products/store/:storeId', () => {
    it('should return products by store ID', async () => {
      // Create a store manager and a store
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      
      // Create products for this store
      await createTestProduct(store._id as mongoose.Types.ObjectId);
      await createTestProduct(store._id as mongoose.Types.ObjectId);

      const response = await request(app)
        .get(`/api/products/store/${store._id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that all returned products belong to the store
      response.body.forEach((product: any) => {
        expect(product.storeId).toBe((store._id as mongoose.Types.ObjectId).toString());
      });
    });

    it('should return empty array for store with no products', async () => {
      // Create a store manager and a store with no products
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);

      const response = await request(app)
        .get(`/api/products/store/${store._id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should allow store owner to update their product', async () => {
      // Create a store manager, store, and product
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const updateData = {
        name: 'Updated Product Name',
        description: 'Updated product description',
        price: 129.99,
        isActive: false
      };

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.price).toBe(updateData.price);
      expect(response.body.isActive).toBe(updateData.isActive);
    });

    it('should allow admin to update any product', async () => {
      // Create a store manager, store, and product
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const updateData = {
        name: 'Admin Updated Product',
        price: 199.99
      };

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
    });

    it('should not allow non-owner to update a product', async () => {
      // Create first store manager, store, and product
      const storeManager1 = await createTestStoreManager();
      const store1 = await createTestStore(storeManager1._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store1._id as mongoose.Types.ObjectId);
      
      // Create second store manager
      const storeManager2 = await createTestStoreManager();
      const token = generateToken(storeManager2._id as mongoose.Types.ObjectId, 'store_manager');

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });

    it('should return 404 for non-existent product', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const updateData = {
        name: 'Non-existent Product Update'
      };

      const response = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .set(getAuthHeader(token))
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should allow store owner to delete their product', async () => {
      // Create a store manager, store, and product
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      const token = generateToken(storeManager._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify product is deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should allow admin to delete any product', async () => {
      // Create a store manager, store, and product
      const storeManager = await createTestStoreManager();
      const store = await createTestStore(storeManager._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store._id as mongoose.Types.ObjectId);
      
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');

      // Verify product is deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should not allow non-owner to delete a product', async () => {
      // Create first store manager, store, and product
      const storeManager1 = await createTestStoreManager();
      const store1 = await createTestStore(storeManager1._id as mongoose.Types.ObjectId);
      const product = await createTestProduct(store1._id as mongoose.Types.ObjectId);
      
      // Create second store manager
      const storeManager2 = await createTestStoreManager();
      const token = generateToken(storeManager2._id as mongoose.Types.ObjectId, 'store_manager');

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');

      // Verify product is not deleted
      const notDeletedProduct = await Product.findById(product._id);
      expect(notDeletedProduct).not.toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      // Create an admin
      const admin = await createTestAdmin();
      const token = generateToken(admin._id as mongoose.Types.ObjectId, 'admin');
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });
}); 