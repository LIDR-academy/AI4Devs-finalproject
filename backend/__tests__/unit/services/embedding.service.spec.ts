import embeddingService from '../../../src/services/embedding.service';
import { aiService } from '../../../src/utils/openai';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockFAQFindMany = jest.fn();
  const mockFAQFindUnique = jest.fn();
  const mockFAQChunkDeleteMany = jest.fn();
  const mockFAQChunkCreate = jest.fn();
  const mockFAQChunkFindMany = jest.fn();
  const mockServiceFindMany = jest.fn();
  const mockServiceChunkDeleteMany = jest.fn();
  const mockServiceChunkCreate = jest.fn();
  const mockServiceChunkFindMany = jest.fn();
  const mockDocumentFindMany = jest.fn();
  const mockDocumentChunkDeleteMany = jest.fn();
  const mockDocumentChunkCreate = jest.fn();
  const mockDocumentChunkFindMany = jest.fn();
  const mockDocumentFindUnique = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      fAQ: {
        findMany: mockFAQFindMany,
        findUnique: mockFAQFindUnique,
      },
      service: {
        findMany: mockServiceFindMany,
      },
      document: {
        findMany: mockDocumentFindMany,
        findUnique: mockDocumentFindUnique,
      },
      fAQChunk: {
        deleteMany: mockFAQChunkDeleteMany,
        create: mockFAQChunkCreate,
        findMany: mockFAQChunkFindMany,
      },
      serviceChunk: {
        deleteMany: mockServiceChunkDeleteMany,
        create: mockServiceChunkCreate,
        findMany: mockServiceChunkFindMany,
      },
      documentChunk: {
        deleteMany: mockDocumentChunkDeleteMany,
        create: mockDocumentChunkCreate,
        findMany: mockDocumentChunkFindMany,
      },
      $disconnect: jest.fn(),
    })),
    // Export the mocks so we can access them in tests
    __mocks: {
      mockFAQFindMany,
      mockFAQFindUnique,
      mockFAQChunkDeleteMany,
      mockFAQChunkCreate,
      mockFAQChunkFindMany,
      mockServiceFindMany,
      mockServiceChunkDeleteMany,
      mockServiceChunkCreate,
      mockServiceChunkFindMany,
      mockDocumentFindMany,
      mockDocumentChunkDeleteMany,
      mockDocumentChunkCreate,
      mockDocumentChunkFindMany,
      mockDocumentFindUnique,
    }
  };
});

// Mock aiService
jest.mock('../../../src/utils/openai', () => ({
  aiService: {
    generateEmbedding: jest.fn(),
  },
  splitIntoChunks: jest.fn(),
}));

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Get the mocks
const { __mocks } = require('@prisma/client');

describe('EmbeddingService - Active Records Only', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock splitIntoChunks to return simple chunks
    const { splitIntoChunks } = require('../../../src/utils/openai');
    splitIntoChunks.mockImplementation((text: string) => [text]);
    
    // Mock aiService.generateEmbedding to return a simple embedding
    (aiService.generateEmbedding as jest.Mock).mockResolvedValue([0.1, 0.2, 0.3]);
  });

  describe('generateEmbeddingsForAllFAQs', () => {
    it('should only process active FAQs', async () => {
      const mockFAQs = [
        {
          id: 'faq-1',
          question: 'Active FAQ 1',
          answer: 'Answer 1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'faq-2',
          question: 'Active FAQ 2',
          answer: 'Answer 2',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      __mocks.mockFAQFindMany.mockResolvedValue(mockFAQs);
      // Mock findUnique for each FAQ that will be processed
      __mocks.mockFAQFindUnique.mockImplementation((params: any) => {
        return Promise.resolve(mockFAQs.find(faq => faq.id === params.where.id));
      });
      __mocks.mockFAQChunkDeleteMany.mockResolvedValue({ count: 0 });
      __mocks.mockFAQChunkCreate.mockResolvedValue({});

      await embeddingService.generateEmbeddingsForAllFAQs();

      // Verify that findMany was called with isActive: true filter
      expect(__mocks.mockFAQFindMany).toHaveBeenCalledWith({
        where: {
          isActive: true
        }
      });

      // Verify that embeddings were generated for both active FAQs
      expect(aiService.generateEmbedding).toHaveBeenCalledTimes(2);
      expect(__mocks.mockFAQChunkCreate).toHaveBeenCalledTimes(2);
    });

    it('should not process inactive FAQs', async () => {
      // Mock database to return no active FAQs
      __mocks.mockFAQFindMany.mockResolvedValue([]);

      await embeddingService.generateEmbeddingsForAllFAQs();

      // Verify that findMany was called with isActive: true filter
      expect(__mocks.mockFAQFindMany).toHaveBeenCalledWith({
        where: {
          isActive: true
        }
      });

      // Verify that no embeddings were generated
      expect(aiService.generateEmbedding).not.toHaveBeenCalled();
      expect(__mocks.mockFAQChunkCreate).not.toHaveBeenCalled();
    });
  });

  describe('generateEmbeddingsForAllServiceChunks', () => {
    it('should only process active services', async () => {
      const mockServices = [
        {
          id: 'service-1',
          name: 'Active Service 1',
          description: 'Description 1',
          price: 29.99,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'service-2',
          name: 'Active Service 2',
          description: 'Description 2',
          price: 39.99,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      __mocks.mockServiceFindMany.mockResolvedValue(mockServices);
      __mocks.mockServiceChunkDeleteMany.mockResolvedValue({ count: 0 });
      __mocks.mockServiceChunkCreate.mockResolvedValue({});

      await embeddingService.generateEmbeddingsForAllServiceChunks();

      // Verify that findMany was called with isActive: true filter
      expect(__mocks.mockServiceFindMany).toHaveBeenCalledWith({
        where: {
          isActive: true
        }
      });

      // Verify that embeddings were generated for both active services
      expect(aiService.generateEmbedding).toHaveBeenCalledTimes(2);
      expect(__mocks.mockServiceChunkCreate).toHaveBeenCalledTimes(2);
    });

    it('should not process inactive services', async () => {
      // Mock database to return no active services
      __mocks.mockServiceFindMany.mockResolvedValue([]);

      await embeddingService.generateEmbeddingsForAllServiceChunks();

      // Verify that findMany was called with isActive: true filter
      expect(__mocks.mockServiceFindMany).toHaveBeenCalledWith({
        where: {
          isActive: true
        }
      });

      // Verify that no embeddings were generated
      expect(aiService.generateEmbedding).not.toHaveBeenCalled();
      expect(__mocks.mockServiceChunkCreate).not.toHaveBeenCalled();
    });
  });

  describe('generateEmbeddingsForAllDocuments', () => {
    it('should only process completed and active documents', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          title: 'Document 1',
          originalName: 'doc1.pdf',
          status: 'COMPLETED',
          isActive: true,
          metadata: JSON.stringify({ description: 'Test document 1' }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'doc-2',
          title: 'Document 2',
          originalName: 'doc2.pdf',
          status: 'COMPLETED',
          isActive: true,
          metadata: JSON.stringify({ description: 'Test document 2' }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      __mocks.mockDocumentFindMany.mockResolvedValue(mockDocuments);
      __mocks.mockDocumentFindUnique.mockResolvedValue(mockDocuments[0]);
      __mocks.mockDocumentChunkDeleteMany.mockResolvedValue({ count: 0 });
      __mocks.mockDocumentChunkCreate.mockResolvedValue({});

      await embeddingService.generateEmbeddingsForAllDocuments();

      // Verify that findMany was called with both status and isActive filters
      expect(__mocks.mockDocumentFindMany).toHaveBeenCalledWith({
        where: {
          status: 'COMPLETED',
          isActive: true
        }
      });

      // Verify that embeddings were generated for both completed and active documents
      expect(aiService.generateEmbedding).toHaveBeenCalledTimes(2);
      expect(__mocks.mockDocumentChunkCreate).toHaveBeenCalledTimes(2);
    });

    it('should not process inactive or non-completed documents', async () => {
      // Mock database to return no completed and active documents
      __mocks.mockDocumentFindMany.mockResolvedValue([]);

      await embeddingService.generateEmbeddingsForAllDocuments();

      // Verify that findMany was called with both status and isActive filters
      expect(__mocks.mockDocumentFindMany).toHaveBeenCalledWith({
        where: {
          status: 'COMPLETED',
          isActive: true
        }
      });

      // Verify that no embeddings were generated
      expect(aiService.generateEmbedding).not.toHaveBeenCalled();
      expect(__mocks.mockDocumentChunkCreate).not.toHaveBeenCalled();
    });
  });

  describe('Search methods should filter by isActive', () => {
    it('searchFAQs should only search in active FAQs', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          content: 'Test content',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          faqId: 'faq-1',
          faq: {
            id: 'faq-1',
            question: 'Test question',
            answer: 'Test answer',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      __mocks.mockFAQChunkFindMany.mockResolvedValue(mockChunks);

      await embeddingService.searchFAQs('test query');

      // Verify that findMany was called with isActive: true filter
      expect(__mocks.mockFAQChunkFindMany).toHaveBeenCalledWith({
        include: {
          faq: true
        },
        where: {
          faq: {
            isActive: true
          }
        }
      });
    });

    it('searchServiceChunks should only search in active services', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          content: 'Test content',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          serviceId: 'service-1',
          service: {
            id: 'service-1',
            name: 'Test service',
            description: 'Test description',
            price: 29.99,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      __mocks.mockServiceChunkFindMany.mockResolvedValue(mockChunks);

      await embeddingService.searchServiceChunks('test query');

      // Verify that findMany was called with isActive: true filter
      expect(__mocks.mockServiceChunkFindMany).toHaveBeenCalledWith({
        include: {
          service: true
        },
        where: {
          service: {
            isActive: true
          }
        }
      });
    });

    it('searchDocuments should only search in active and completed documents', async () => {
      const mockChunks = [
        {
          id: 'chunk-1',
          content: 'Test content',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          documentId: 'doc-1',
          document: {
            id: 'doc-1',
            title: 'Test document',
            originalName: 'test.pdf',
            status: 'COMPLETED',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      __mocks.mockDocumentChunkFindMany.mockResolvedValue(mockChunks);

      await embeddingService.searchDocuments('test query');

      // Verify that findMany was called with both status and isActive filters
      expect(__mocks.mockDocumentChunkFindMany).toHaveBeenCalledWith({
        include: {
          document: true
        },
        where: {
          document: {
            status: 'COMPLETED',
            isActive: true
          }
        }
      });
    });
  });
}); 