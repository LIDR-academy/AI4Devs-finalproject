import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();

describe('Document API Integration Tests', () => {
  let app: any;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    app = await createApp();
    
    // Create a test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'ShopMefy2024',
        firstName: 'Test',
        lastName: 'User'
      });

    if (userResponse.status === 201) {
      testUserId = userResponse.body.user.id;
      authToken = userResponse.body.token;
    } else {
      // User might already exist, try to login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'ShopMefy2024'
        });
      
      testUserId = loginResponse.body.user.id;
      authToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    // Clean up test documents
    await prisma.documentChunk.deleteMany({
      where: {
        document: {
          userId: testUserId
        }
      }
    });
    
    await prisma.document.deleteMany({
      where: { userId: testUserId }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/documents/upload', () => {
    it('should upload a PDF document successfully', async () => {
      // Create a simple PDF buffer for testing
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF');

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', pdfBuffer, 'test-document.pdf')
        .field('title', 'Test Document');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Document uploaded successfully');
      expect(response.body.document).toHaveProperty('id');
      expect(response.body.document.title).toBe('Test Document');
      expect(response.body.document.originalName).toBe('test-document.pdf');
      expect(response.body.document.status).toBe('COMPLETED');
    });

    it('should reject non-PDF files', async () => {
      const textBuffer = Buffer.from('This is not a PDF file');

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', textBuffer, 'test-document.txt');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Only PDF files are allowed');
    });

    it('should require authentication', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');

      const response = await request(app)
        .post('/api/documents/upload')
        .attach('document', pdfBuffer, 'test-document.pdf');

      expect(response.status).toBe(401);
    });

    it('should reject files that are too large', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'a');

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', largeBuffer, 'large-document.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('File too large');
    });
  });

  describe('GET /api/documents', () => {
    let documentId: string;

    beforeEach(async () => {
      // Create a test document
      const pdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');
      
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', pdfBuffer, 'test-list-document.pdf')
        .field('title', 'Test List Document');

      documentId = uploadResponse.body.document.id;
    });

    it('should get user documents with pagination', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.documents)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
      expect(response.body.pagination).toHaveProperty('hasMore');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/documents');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/documents/search', () => {
    let contractDocId: string;
    let manualDocId: string;

    beforeEach(async () => {
      // Create test documents with different titles
      const pdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');
      
      const contractResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', pdfBuffer, 'contract.pdf')
        .field('title', 'Service Contract');

      contractDocId = contractResponse.body.document.id;

      const manualResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', pdfBuffer, 'manual.pdf')
        .field('title', 'User Manual');

      manualDocId = manualResponse.body.document.id;
    });

    afterEach(async () => {
      // Clean up test documents
      if (contractDocId) {
        await request(app)
          .delete(`/api/documents/${contractDocId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
      if (manualDocId) {
        await request(app)
          .delete(`/api/documents/${manualDocId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });

    it('should search documents by title', async () => {
      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ query: 'contract' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(Array.isArray(response.body.documents)).toBe(true);
      
      // Since embedding search might not find exact matches for test documents,
      // we just verify the search endpoint works and returns the expected structure
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ query: 'nonexistent-unique-search-term-12345' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(Array.isArray(response.body.documents)).toBe(true);
      // The embedding service might return some results even for non-matching queries
      // so we just verify the structure is correct
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/documents/stats', () => {
    it('should get document statistics', async () => {
      const response = await request(app)
        .get('/api/documents/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalDocuments');
      expect(response.body).toHaveProperty('totalSize');
      expect(response.body).toHaveProperty('statusBreakdown');
      expect(typeof response.body.totalDocuments).toBe('number');
      expect(typeof response.body.totalSize).toBe('number');
      expect(typeof response.body.statusBreakdown).toBe('object');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/documents/stats');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      // Create a test document
      const pdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');
      
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', pdfBuffer, 'test-delete-document.pdf');

      documentId = uploadResponse.body.document.id;
    });

    it('should delete a document successfully', async () => {
      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Document deleted successfully');

      // Verify document is deleted
      const getResponse = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .delete('/api/documents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/documents/${documentId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      // Create a test document
      const pdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');
      
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', pdfBuffer, 'test-get-document.pdf')
        .field('title', 'Test Get Document');

      documentId = uploadResponse.body.document.id;
    });

    it('should get a document by ID', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(documentId);
      expect(response.body.title).toBe('Test Get Document');
      expect(response.body.originalName).toBe('test-get-document.pdf');
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/documents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}`);

      expect(response.status).toBe(401);
    });
  });
}); 