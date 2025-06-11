import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import productController from '../../src/controllers/product.controller';
import { Product } from '../../src/domain/entities/Product';
import { Price } from '../../src/domain/valueObjects/Price';
import { ProductId } from '../../src/domain/valueObjects/ProductId';
import { ProductName } from '../../src/domain/valueObjects/ProductName';
import productService from '../../src/services/product.service';

// Mock the product service module
jest.mock('../../src/services/product.service');

// Mock JWT verification
jest.mock('jsonwebtoken');

// Mock middleware di autenticazione
jest.mock('../../src/middlewares/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
}));

// Create a factory function for mocking products
function createMockProduct(id: string, name: string, description: string, price: number, imageUrl: string, category: string) {
  // Use fixed valid UUIDs for testing
  const uuidMap: { [key: string]: string } = {
    'product1': '11111111-1111-1111-1111-111111111111',
    'product2': '22222222-2222-2222-2222-222222222222',
    'new-service-id': '33333333-3333-3333-3333-333333333333'
  };
  
  const validId = uuidMap[id] || '00000000-0000-0000-0000-000000000000';
  
  return new Product(
    new ProductId(validId),
    new ProductName(name),
    description,
    new Price(price),
    category,
    [], // tags
    true, // isActive
    new Date(),
    new Date()
  );
}

describe('Product API Integration Tests', () => {
  const mockUserId = 'user123';
  let authToken: string;
  let app: express.Application;
  
  beforeAll(async () => {
    // Create and setup Express app directly
    app = express();
    
    // Middleware
    app.use(express.json());
    
    // Set up product routes manually
    app.get('/api/products', productController.getProducts.bind(productController));
    app.get('/api/products/categories', productController.getCategories.bind(productController));
    app.get('/api/products/:id', productController.getProductById.bind(productController));
    app.post('/api/products', productController.createProduct.bind(productController));
    app.put('/api/products/:id', productController.updateProduct.bind(productController));
    app.delete('/api/products/:id', productController.deleteProduct.bind(productController));
    
    // Debug middleware
    app.use((req, res, next) => {
      // Removed console.log for cleaner test output
      next();
    });
    
    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    });
    
    // Create a valid JWT token for testing
    authToken = 'Bearer mockToken';
    
    // Mock JWT verify
    (jwt.verify as jest.Mock) = jest.fn().mockImplementation((token, secret) => ({
      userId: mockUserId,
    }));
  });
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock products
    const product1 = createMockProduct(
      'product1',
      'Test Product 1',
      'Description 1',
      19.99,
      'https://example.com/image1.jpg',
      'Electronics'
    );
    
    const product2 = createMockProduct(
      'product2',
      'Test Product 2',
      'Description 2',
      29.99,
      'https://example.com/image2.jpg',
      'Books'
    );
    
    // Setup default mock responses
    jest.spyOn(productService, 'getProducts').mockResolvedValue({
      data: [product1, product2],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    });
    
    jest.spyOn(productService, 'getProductById').mockResolvedValue(product1);
    jest.spyOn(productService, 'createProduct').mockResolvedValue(product1);
    jest.spyOn(productService, 'updateProduct').mockResolvedValue(product1);
    jest.spyOn(productService, 'deleteProduct').mockResolvedValue({ success: true, message: 'Product deleted successfully' });
    jest.spyOn(productService, 'getCategories').mockResolvedValue(['Electronics', 'Books']);
    
    // Setup auth token
    authToken = 'Bearer test-token';
  });
  
  describe('GET /api/products', () => {
    it('should return a list of products', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', authToken);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('GET /api/products/:id', () => {
    it('should return a product by ID', async () => {
      const response = await request(app)
        .get('/api/products/product1')
        .set('Authorization', authToken);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });
  });
  
  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New product description',
        price: 39.99,
        imageUrl: 'https://example.com/new.jpg',
        category: 'New Category'
      };
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', authToken)
        .send(newProduct);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('product');
    });
  });
  
  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      const productId = 'product1';
      const updateData = {
        name: 'Updated Product',
        price: 45.99
      };
      
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', authToken)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('product');
    });
  });
  
  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const response = await request(app)
        .delete('/api/products/product1')
        .set('Authorization', authToken);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
  
  describe('GET /api/products/categories', () => {
    it('should return product categories', async () => {
      const response = await request(app)
        .get('/api/products/categories')
        .set('Authorization', authToken);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('GET /api/products/non-existent-id', () => {
    it('should return 404 for non-existent product', async () => {
      // Mock the service to throw an error for non-existent product
      jest.spyOn(productService, 'getProductById').mockRejectedValue(
        new Error('Product not found')
      );

      const response = await request(app)
        .get('/api/products/non-existent-id')
        .set('Authorization', authToken);
      
      expect(response.status).toBe(404);
    });
  });
}); 