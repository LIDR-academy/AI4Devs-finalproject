import { PrismaClient } from '@prisma/client';
import faqService from '../../src/services/faq.service';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockFAQFindMany = jest.fn();
  const mockFAQCount = jest.fn();
  const mockFAQCreate = jest.fn();
  const mockFAQFindUnique = jest.fn();
  const mockFAQUpdate = jest.fn();
  const mockFAQDelete = jest.fn();
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      fAQ: {
        findMany: mockFAQFindMany,
        count: mockFAQCount,
        create: mockFAQCreate,
        findUnique: mockFAQFindUnique,
        update: mockFAQUpdate,
        delete: mockFAQDelete,
      },
      $disconnect: jest.fn(),
    })),
  };
});

// Mock embeddingService
jest.mock('../../src/services/embedding.service', () => ({
  searchFAQs: jest.fn(),
  generateEmbeddingsForFAQ: jest.fn(),
}));

import embeddingService from '../../src/services/embedding.service';

describe('FAQ Service', () => {
  let prisma: PrismaClient;
  
  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });
  
  const mockFAQ = {
    id: '123',
    question: 'Test Question?',
    answer: 'This is a test answer.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  describe('createFAQ', () => {
    it('should create an FAQ successfully', async () => {
      const createData = {
        question: 'Test Question?',
        answer: 'This is a test answer.',
      };
      
      (prisma.fAQ.create as jest.Mock).mockResolvedValue(mockFAQ);
      
      const result = await faqService.createFAQ(createData);
      
      expect(prisma.fAQ.create).toHaveBeenCalledWith({
        data: createData,
      });
      
      expect(result).toEqual(mockFAQ);
    });
    
    it('should throw an error if creation fails', async () => {
      const createData = {
        question: 'Test Question?',
        answer: 'This is a test answer.',
      };
      
      const error = new Error('Database error');
      (prisma.fAQ.create as jest.Mock).mockRejectedValue(error);
      
      await expect(faqService.createFAQ(createData)).rejects.toThrow('Failed to create FAQ');
    });
  });
  
  describe('getFAQs', () => {
    it('should get FAQs with pagination', async () => {
      const mockFAQs = [mockFAQ];
      const mockTotal = 1;
      
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue(mockFAQs);
      (prisma.fAQ.count as jest.Mock).mockResolvedValue(mockTotal);
      
      const result = await faqService.getFAQs();
      
      expect(prisma.fAQ.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { id: 'desc' },
      });
      
      expect(prisma.fAQ.count).toHaveBeenCalledWith({ where: {} });
      
      expect(result).toEqual({
        data: [mockFAQ],
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          totalPages: Math.ceil(mockTotal / 10),
        },
      });
    });
    
    it('should apply filters correctly', async () => {
      const filters = {
        search: 'test',
      };
      
      const mockSearchResults = [mockFAQ];
      (embeddingService.searchFAQs as jest.Mock).mockResolvedValue(mockSearchResults);

      const result = await faqService.getFAQs(filters);
      
      // Now the service uses embeddingService for search
      expect(embeddingService.searchFAQs).toHaveBeenCalledWith('test');
      expect(result.data).toEqual(mockSearchResults);
      expect(result.pagination.total).toBe(1);
    });
  });
  
  describe('getAllFAQs', () => {
    it('should return all FAQs', async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([mockFAQ]);
      
      const result = await faqService.getAllFAQs();
      
      expect(prisma.fAQ.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
      });
      
      expect(result).toEqual([mockFAQ]);
    });
  });
  
  describe('getFAQById', () => {
    it('should return an FAQ when found', async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValue(mockFAQ);
      
      const result = await faqService.getFAQById('123');
      
      expect(prisma.fAQ.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      
      expect(result).toEqual(mockFAQ);
    });
    
    it('should throw an error when FAQ not found', async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValue(null);
      
      await expect(faqService.getFAQById('999')).rejects.toThrow('FAQ not found');
    });
  });
  
  describe('updateFAQ', () => {
    it('should update an FAQ successfully', async () => {
      const updateData = {
        question: 'Updated Question?',
        answer: 'Updated answer.',
      };
      
      const updatedFAQ = {
        ...mockFAQ,
        ...updateData,
      };
      
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValue(mockFAQ);
      (prisma.fAQ.update as jest.Mock).mockResolvedValue(updatedFAQ);
      
      const result = await faqService.updateFAQ('123', updateData);
      
      expect(prisma.fAQ.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      
      expect(prisma.fAQ.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateData,
      });
      
      expect(result).toEqual(updatedFAQ);
    });
    
    it('should throw an error when FAQ not found', async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValue(null);
      
      await expect(faqService.updateFAQ('999', { question: 'Updated?' })).rejects.toThrow('FAQ not found');
    });
  });
  
  describe('deleteFAQ', () => {
    it('should delete an FAQ successfully', async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValue(mockFAQ);
      (prisma.fAQ.delete as jest.Mock).mockResolvedValue(mockFAQ);
      
      const result = await faqService.deleteFAQ('123');
      
      expect(prisma.fAQ.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      
      expect(prisma.fAQ.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      
      expect(result).toEqual({ success: true, message: 'FAQ deleted successfully' });
    });
    
    it('should throw an error when FAQ not found', async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValue(null);
      
      await expect(faqService.deleteFAQ('999')).rejects.toThrow('FAQ not found');
    });
  });
}); 