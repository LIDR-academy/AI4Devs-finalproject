import express from 'express';
import request from 'supertest';
import faqController from '../../src/controllers/faq.controller';
import { prisma } from '../../src/lib/prisma';
import faqService from '../../src/services/faq.service';
import createMockExpressApp from './mock/express.mock';

// Mock the FAQ service
jest.mock('../../src/services/faq.service');

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id' })
}));

// Mock authentication middleware
jest.mock('../../src/middlewares/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { userId: 'test-user-id' };
    next();
  }),
}));

describe('FAQ API Integration Tests', () => {
  let app: express.Express;
  let testFaqId: string;
  let authToken: string;

  const mockFaq = {
    id: '123-test-faq',
    question: 'Test Question',
    answer: 'Test Answer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const faqListResponse = {
    data: [mockFaq],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    }
  };

  beforeAll(async () => {
    // Create a mock Express app
    app = createMockExpressApp();

    // Setup FAQ routes
    app.get('/api/faqs', faqController.getFAQs);
    app.get('/api/faqs/public', faqController.getPublicFAQs);
    app.get('/api/faqs/:id', faqController.getFAQById);
    app.post('/api/faqs', faqController.createFAQ);
    app.put('/api/faqs/:id', faqController.updateFAQ);
    app.delete('/api/faqs/:id', faqController.deleteFAQ);

    // Mock the service methods
    (faqService.getFAQs as jest.Mock).mockResolvedValue(faqListResponse);
    (faqService.getAllFAQs as jest.Mock).mockResolvedValue([mockFaq]);
    (faqService.getFAQById as jest.Mock).mockResolvedValue(mockFaq);
    (faqService.createFAQ as jest.Mock).mockResolvedValue({...mockFaq, id: 'new-faq-id'});
    (faqService.updateFAQ as jest.Mock).mockResolvedValue({ ...mockFaq, question: 'Updated Question' });
    (faqService.deleteFAQ as jest.Mock).mockResolvedValue({ success: true, message: 'FAQ deleted successfully' });

    // Use mock auth token
    authToken = 'Bearer mock-token';

    // Create a test FAQ
    const testFaq = await prisma.fAQ.create({
      data: {
        question: 'Test Question?',
        answer: 'This is a test answer.',
      },
    });
    testFaqId = testFaq.id;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.fAQ.deleteMany({
      where: {
        question: 'Test Question?',
      },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/faqs', () => {
    it('should get all FAQs with pagination', async () => {
      const response = await request(app)
        .get('/api/faqs')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/faqs/public', () => {
    it('should get all public FAQs', async () => {
      const response = await request(app)
        .get('/api/faqs/public');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/faqs/:id', () => {
    it('should get a specific FAQ', async () => {
      const response = await request(app)
        .get(`/api/faqs/${testFaqId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('question');
    });
  });

  describe('POST /api/faqs', () => {
    it('should create a new FAQ', async () => {
      const newFaq = {
        question: 'New Test Question?',
        answer: 'This is a new test answer.',
      };

      const response = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newFaq);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('faq');
    });
  });

  describe('PUT /api/faqs/:id', () => {
    it('should update an existing FAQ', async () => {
      const updateData = {
        question: 'Updated Test Question?',
        answer: 'This is an updated test answer.',
      };

      const response = await request(app)
        .put(`/api/faqs/${testFaqId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('faq');
    });
  });

  describe('DELETE /api/faqs/:id', () => {
    it('should delete an existing FAQ', async () => {
      const response = await request(app)
        .delete(`/api/faqs/${testFaqId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });
}); 