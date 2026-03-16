import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../../src/app';
import embeddingService from '../../../src/services/embedding.service';
import { generateJwtToken } from '../../../src/utils/jwt';

// Mock the embedding service
jest.mock('../../../src/services/embedding.service');
const mockEmbeddingService = embeddingService as jest.Mocked<typeof embeddingService>;

jest.mock('@prisma/client', () => {
  // Mock data
  const mockService = {
    id: 'test-service-id',
    name: 'Integration Test Service',
    description: 'Service created for integration testing',
    price: 29.99,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockServiceChunk = {
    id: 'test-chunk-id',
    content: 'Test service chunk content',
    serviceId: 'test-service-id',
    embedding: JSON.stringify([0.1, 0.2, 0.3]),
    createdAt: new Date(),
    updatedAt: new Date(),
    service: mockService
  };

  const mockFAQChunk = {
    id: 'test-faq-chunk-id',
    content: 'Test FAQ chunk content',
    faqId: 'test-faq-id',
    embedding: JSON.stringify([0.1, 0.2, 0.3]),
    createdAt: new Date(),
    updatedAt: new Date(),
    faq: {
      id: 'test-faq-id',
      question: 'Test question?',
      answer: 'Test answer',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  const mockDocumentChunk = {
    id: 'test-doc-chunk-id',
    content: 'Test document chunk content',
    documentId: 'test-doc-id',
    chunkIndex: 0,
    pageNumber: 1,
    embedding: JSON.stringify([0.1, 0.2, 0.3]),
    createdAt: new Date(),
    updatedAt: new Date(),
    document: {
      id: 'test-doc-id',
      title: 'Test Document',
      originalName: 'test.pdf',
      filename: 'test.pdf',
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findFirst: jest.fn().mockResolvedValue(mockUser),
        findUnique: jest.fn().mockResolvedValue(mockUser),
        findMany: jest.fn().mockResolvedValue([mockUser]),
        create: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
        delete: jest.fn().mockResolvedValue(mockUser)
      },
      service: {
        findMany: jest.fn().mockResolvedValue([mockService]),
        findUnique: jest.fn().mockImplementation((args) => {
          if (args.where.id === 'test-service-id' || args.where.id === mockService.id) {
            return Promise.resolve(mockService);
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockResolvedValue({
          id: 'new-service-id',
          name: 'Created Service',
          description: 'This service was created during integration testing',
          price: 39.99,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        update: jest.fn().mockResolvedValue({
          ...mockService,
          name: 'Updated Service Name',
          price: 49.99
        }),
        delete: jest.fn().mockResolvedValue(mockService),
        count: jest.fn().mockResolvedValue(1)
      },
      serviceChunk: {
        findMany: jest.fn().mockResolvedValue([mockServiceChunk]),
        create: jest.fn().mockResolvedValue(mockServiceChunk),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(1)
      },
      fAQ: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      },
      fAQChunk: {
        findMany: jest.fn().mockResolvedValue([mockFAQChunk]),
        create: jest.fn().mockResolvedValue(mockFAQChunk),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(1)
      },
      document: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      },
      documentChunk: {
        findMany: jest.fn().mockResolvedValue([mockDocumentChunk]),
        create: jest.fn().mockResolvedValue(mockDocumentChunk),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(1)
      },
      product: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      },
      category: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
      },
      profile: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({})
      },
      agent: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({})
      },
      $disconnect: jest.fn().mockResolvedValue(undefined)
    }))
  };
});

let app: Express;
let authToken: string = 'demo-token-test-user'; // Using the format expected by the auth middleware
let serviceId: string = 'test-service-id';

beforeAll(async () => {
  app = await createApp();
  
  // Mock user for JWT token generation
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Generate JWT token with mock user
  generateJwtToken(mockUser);
});

afterAll(async () => {
  // No need to disconnect as we're using mocks
});

describe('Service API', () => {
  beforeEach(() => {
    // Setup all embedding service mocks
    mockEmbeddingService.generateEmbeddingsForAllServiceChunks.mockResolvedValue(undefined);
    mockEmbeddingService.searchServiceChunks.mockResolvedValue([]);
    mockEmbeddingService.getServiceChunks.mockResolvedValue([]);
    mockEmbeddingService.getAllServiceChunks.mockResolvedValue([]);
    mockEmbeddingService.clearAllServiceChunks.mockResolvedValue(undefined);
    mockEmbeddingService.debugSearchServiceChunks.mockResolvedValue({
      query: 'test',
      queryEmbeddingLength: 1536,
      totalChunks: 0,
      results: [],
      topResults: []
    });
  });

  describe('GET /services', () => {
    it('should return a list of services', async () => {
      const response = await request(app).get('/api/services');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should apply filters correctly', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ isActive: 'true', search: 'integration' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Integration');
    });
    
    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ page: 1, limit: 5 });
      
      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual(expect.objectContaining({
        page: 1,
        limit: 5,
      }));
    });
  });
  
  describe('GET /services/active', () => {
    it('should return only active services', async () => {
      const response = await request(app).get('/api/services/active');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0].isActive).toBe(true);
      }
    });
  });
  
  describe('GET /services/:id', () => {
    it('should return a service by ID', async () => {
      const response = await request(app).get(`/api/services/${serviceId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', serviceId);
      expect(response.body).toHaveProperty('name', 'Integration Test Service');
    });
    
    it('should return 404 for non-existent service', async () => {
      const response = await request(app).get('/api/services/nonexistent-id');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /services', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          name: 'New Service',
          description: 'Service description',
          price: 19.99,
        });
      
      expect(response.status).toBe(401);
    });
    
    it('should create a new service when authenticated', async () => {
      const newService = {
        name: 'Created Service',
        description: 'This service was created during integration testing',
        price: 39.99,
      };
      
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newService);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newService.name);
      expect(response.body).toHaveProperty('price', newService.price);
    });
    
    it('should validate input data', async () => {
      const invalidService = {
        name: 'A', // too short
        description: 'Short', // too short
        price: -10, // negative price
      };
      
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidService);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('PUT /services/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/services/${serviceId}`)
        .send({
          name: 'Updated Name',
        });
      
      expect(response.status).toBe(401);
    });
    
    it('should update a service when authenticated', async () => {
      const updateData = {
        name: 'Updated Service Name',
        price: 49.99,
      };
      
      const response = await request(app)
        .put(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('price', updateData.price);
    });
    
    it('should return 404 for non-existent service', async () => {
      const response = await request(app)
        .put('/api/services/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Should Fail' });
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('DELETE /services/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app).delete(`/api/services/${serviceId}`);
      
      expect(response.status).toBe(401);
    });
    
    it('should delete a service when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
    
    it('should return 404 for non-existent service', async () => {
      const response = await request(app)
        .delete('/api/services/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send();
      
      expect(response.status).toBe(404);
    });
  });

  // Add ServiceChunk integration tests
  describe('ServiceChunk Embedding Integration', () => {
    let testServiceId: string;
    let embeddingService: any;

    beforeAll(() => {
      // Get the mocked embedding service
      embeddingService = require('../../../src/services/embedding.service').default;
    });

    beforeEach(async () => {
      // Reset all mocks before each test
      jest.clearAllMocks();
      
      // Create a test service for embedding tests
      const serviceData = {
        name: 'Wine Tasting Experience',
        description: 'Professional wine tasting session with our sommelier, including 6 premium Italian wines with detailed explanations.',
        price: 75.00,
        isActive: true
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData);

      testServiceId = response.body.id;
    });

    afterEach(async () => {
      // Clean up test service
      if (testServiceId) {
        await request(app)
          .delete(`/api/services/${testServiceId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });

    describe('POST /api/embeddings/services/:id/generate', () => {
      // Test removed - individual service embedding generation no longer supported
    });

    describe('POST /api/embeddings/services/generate-all', () => {
      it('should generate embeddings for all active services', async () => {
        const response = await request(app)
          .post('/api/embeddings/services/generate-all')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Embeddings generated for all services');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/embeddings/services/generate-all');

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/embeddings/services/search', () => {
      beforeEach(async () => {
        // Mock search results
        embeddingService.searchServiceChunks.mockResolvedValue([
          {
            id: 'test-service-id',
            name: 'Wine Tasting Experience',
            description: 'Professional wine tasting session',
            price: 75.00,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
      });

      it('should search services using embeddings', async () => {
        const response = await request(app)
          .get('/api/embeddings/services/search')
          .query({ query: 'wine tasting', limit: 5 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('services');
        expect(response.body).toHaveProperty('total');
        expect(Array.isArray(response.body.services)).toBe(true);
      });

      it('should return empty results for non-matching query', async () => {
        // Mock empty search results
        embeddingService.searchServiceChunks.mockResolvedValueOnce([]);
        
        const response = await request(app)
          .get('/api/embeddings/services/search')
          .query({ query: 'nonexistent service type', limit: 5 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.services).toHaveLength(0);
        expect(response.body.total).toBe(0);
      });

      it('should require query parameter', async () => {
        const response = await request(app)
          .get('/api/embeddings/services/search');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Query parameter is required');
      });
    });

    describe('GET /api/embeddings/services/debug/chunks', () => {
      beforeEach(async () => {
        // Mock debug chunks response
        embeddingService.getAllServiceChunks.mockResolvedValue([
          {
            id: 'test-chunk-id',
            content: 'Test service chunk content',
            serviceId: 'test-service-id',
            embedding: JSON.stringify([0.1, 0.2, 0.3]),
            createdAt: new Date(),
            updatedAt: new Date(),
            service: {
              id: 'test-service-id',
              name: 'Wine Tasting Experience'
            }
          }
        ]);
      });

      it('should return all service chunks for debugging', async () => {
        const response = await request(app)
          .get('/api/embeddings/services/debug/chunks');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('chunks');
        expect(Array.isArray(response.body.chunks)).toBe(true);
      });

      it('should return chunks for specific service', async () => {
        // Use a fixed service ID for this test since testServiceId might be undefined
        const fixedServiceId = 'test-service-id';
        
        // Mock service-specific chunks
        embeddingService.getServiceChunks.mockResolvedValueOnce([
          {
            id: 'test-chunk-id',
            content: 'Test service chunk content',
            serviceId: fixedServiceId,
            embedding: JSON.stringify([0.1, 0.2, 0.3]),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
        
        const response = await request(app)
          .get(`/api/embeddings/services/debug/chunks/${fixedServiceId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('serviceId', fixedServiceId);
        expect(response.body).toHaveProperty('chunks');
        expect(Array.isArray(response.body.chunks)).toBe(true);
      });
    });

    describe('GET /api/embeddings/services/debug/search', () => {
      beforeEach(async () => {
        // Mock debug search response
        embeddingService.debugSearchServiceChunks.mockResolvedValue({
          query: 'wine tasting',
          queryEmbeddingLength: 1536,
          totalChunks: 1,
          results: [
            {
              serviceId: 'test-service-id',
              serviceName: 'Wine Tasting Experience',
              chunkContent: 'Test service chunk content...',
              similarity: 0.85,
              embeddingLength: 1536,
              hasValidEmbedding: true
            }
          ],
          topResults: [
            {
              serviceName: 'Wine Tasting Experience',
              similarity: 0.85
            }
          ]
        });
      });

      it('should return detailed search debug information', async () => {
        const response = await request(app)
          .get('/api/embeddings/services/debug/search')
          .query({ query: 'wine tasting', limit: 5 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('query', 'wine tasting');
        expect(response.body).toHaveProperty('queryEmbeddingLength');
        expect(response.body).toHaveProperty('totalChunks');
        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      });

      it('should require query parameter', async () => {
        const response = await request(app)
          .get('/api/embeddings/services/debug/search');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Query parameter is required');
      });
    });

    describe('POST /api/embeddings/services/clear-and-regenerate', () => {
      it('should clear and regenerate all service embeddings', async () => {
        const response = await request(app)
          .post('/api/embeddings/services/clear-and-regenerate')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'All service chunks cleared and embeddings regenerated');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/embeddings/services/clear-and-regenerate');

        expect(response.status).toBe(401);
      });
    });
  });
}); 