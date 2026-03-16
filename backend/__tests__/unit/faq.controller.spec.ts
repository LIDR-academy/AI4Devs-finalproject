import { Request, Response } from 'express';
import { ZodError } from 'zod';
import faqController from '../../src/controllers/faq.controller';
import faqService from '../../src/services/faq.service';

// Mock the FAQ service
jest.mock('../../src/services/faq.service');

describe('FAQ Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {};
    mockResponse = {
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getFAQs', () => {
    it('should return FAQs with pagination', async () => {
      const mockFAQs = {
        data: [
          {
            id: '1',
            question: 'Test Question?',
            answer: 'Test Answer',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      (faqService.getFAQs as jest.Mock).mockResolvedValue(mockFAQs);

      mockRequest.query = {
        page: '1',
        limit: '10',
        search: 'test',
      };

      await faqController.getFAQs(mockRequest as Request, mockResponse as Response);

      expect(faqService.getFAQs).toHaveBeenCalledWith(
        {
          search: 'test',
        },
        1,
        10
      );
      expect(responseObject).toEqual(mockFAQs);
    });

    it('should handle validation errors', async () => {
      const zodError = new ZodError([{
        code: 'invalid_type',
        expected: 'object',
        received: 'undefined',
        path: [],
        message: 'Required'
      }]);
      
      (faqService.getFAQs as jest.Mock).mockRejectedValue(zodError);

      await faqController.getFAQs(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Validation error',
        details: zodError.errors,
      });
    });
  });

  describe('getPublicFAQs', () => {
    it('should return all FAQs', async () => {
      const mockFAQs = [
        {
          id: '1',
          question: 'Test Question?',
          answer: 'Test Answer',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (faqService.getAllFAQs as jest.Mock).mockResolvedValue(mockFAQs);

      await faqController.getPublicFAQs(mockRequest as Request, mockResponse as Response);

      expect(faqService.getAllFAQs).toHaveBeenCalledWith();
      expect(responseObject).toEqual(mockFAQs);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      (faqService.getAllFAQs as jest.Mock).mockRejectedValue(error);

      await faqController.getPublicFAQs(mockRequest as Request, mockResponse as Response);

      // The controller now returns 200 with empty array on errors for public endpoint
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual([]);
    });
  });

  describe('getFAQById', () => {
    it('should return a single FAQ', async () => {
      const mockFAQ = {
        id: '1',
        question: 'Test Question?',
        answer: 'Test Answer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (faqService.getFAQById as jest.Mock).mockResolvedValue(mockFAQ);

      mockRequest.params = { id: '1' };

      await faqController.getFAQById(mockRequest as Request, mockResponse as Response);

      expect(faqService.getFAQById).toHaveBeenCalledWith('1');
      expect(responseObject).toEqual(mockFAQ);
    });

    it('should handle not found error', async () => {
      const error = new Error('FAQ not found');
      (faqService.getFAQById as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { id: '999' };

      await faqController.getFAQById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        error: 'FAQ not found',
      });
    });

    it('should handle other errors', async () => {
      const error = new Error('Test error');
      (faqService.getFAQById as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { id: '1' };

      await faqController.getFAQById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        error: 'Failed to get FAQ',
      });
    });
  });

  describe('createFAQ', () => {
    it('should create a new FAQ', async () => {
      const mockFAQ = {
        id: '1',
        question: 'Test Question?',
        answer: 'Test Answer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (faqService.createFAQ as jest.Mock).mockResolvedValue(mockFAQ);

      mockRequest.body = {
        question: 'Test Question?',
        answer: 'Test Answer',
      };

      await faqController.createFAQ(mockRequest as Request, mockResponse as Response);

      expect(faqService.createFAQ).toHaveBeenCalledWith({
        question: 'Test Question?',
        answer: 'Test Answer',
        isActive: true
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        message: 'FAQ created successfully',
        faq: mockFAQ,
      });
    });

    it('should handle validation errors', async () => {
      const zodError = new ZodError([{
        code: 'too_small',
        minimum: 5,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Question must be at least 5 characters',
        path: ['question']
      }]);

      mockRequest.body = {
        question: 'Hi?',
        answer: 'Test Answer',
      };

      // Mock the service to throw validation error
      (faqService.createFAQ as jest.Mock).mockRejectedValue(zodError);

      await faqController.createFAQ(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Validation error',
        details: zodError.errors,
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Test error');
      (faqService.createFAQ as jest.Mock).mockRejectedValue(error);

      mockRequest.body = {
        question: 'Test Question?',
        answer: 'Test Answer',
      };

      await faqController.createFAQ(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Test error',
      });
    });
  });

  describe('updateFAQ', () => {
    it('should update an existing FAQ', async () => {
      const mockFAQ = {
        id: '1',
        question: 'Updated Question?',
        answer: 'Updated Answer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (faqService.updateFAQ as jest.Mock).mockResolvedValue(mockFAQ);

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        question: 'Updated Question?',
        answer: 'Updated Answer',
      };

      await faqController.updateFAQ(mockRequest as Request, mockResponse as Response);

      expect(faqService.updateFAQ).toHaveBeenCalledWith('1', mockRequest.body);
      expect(responseObject).toEqual({
        message: 'FAQ updated successfully',
        faq: mockFAQ,
      });
    });

    it('should handle not found error', async () => {
      const error = new Error('FAQ not found');
      (faqService.updateFAQ as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { id: '999' };
      mockRequest.body = {
        question: 'Updated Question?',
      };

      await faqController.updateFAQ(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        error: 'FAQ not found',
      });
    });
  });

  describe('deleteFAQ', () => {
    it('should delete an existing FAQ', async () => {
      const deleteResult = { success: true, message: 'FAQ deleted successfully' };
      (faqService.deleteFAQ as jest.Mock).mockResolvedValue(deleteResult);

      mockRequest.params = { id: '1' };

      await faqController.deleteFAQ(mockRequest as Request, mockResponse as Response);

      expect(faqService.deleteFAQ).toHaveBeenCalledWith('1');
      expect(responseObject).toEqual(deleteResult);
    });

    it('should handle not found error', async () => {
      const error = new Error('FAQ not found');
      (faqService.deleteFAQ as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { id: '999' };

      await faqController.deleteFAQ(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        error: 'FAQ not found',
      });
    });
  });
}); 