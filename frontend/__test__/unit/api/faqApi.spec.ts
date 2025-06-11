import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock axios directly
const mockedAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('axios', () => ({
  default: mockedAxios
}));

// Import after mocking
const { faqApi } = await import('../../../src/api/faqApi');

describe('faqApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFAQs', () => {
    it('should call GET endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { data: [] } });
      
      await faqApi.getFAQs();
      
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  describe('createFAQ', () => {
    it('should call POST endpoint', async () => {
      mockedAxios.post.mockResolvedValue({ data: { id: '1' } });
      
      await faqApi.createFAQ({ question: 'Test', answer: 'Test', isActive: true });
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('updateFAQ', () => {
    it('should call PUT endpoint with correct data', async () => {
      const updateData = {
        question: 'Updated Question',
        isActive: false
      };
      
      const mockResponse = { data: { ...updateData, id: '1' } };
      mockedAxios.put.mockResolvedValue(mockResponse);
      
      await faqApi.updateFAQ('1', updateData);
      
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/faqs/1'),
        updateData,
        expect.any(Object)
      );
    });
  });

  describe('deleteFAQ', () => {
    it('should call DELETE endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.delete.mockResolvedValue(mockResponse);
      
      await faqApi.deleteFAQ('1');
      
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/faqs/1'),
        expect.any(Object)
      );
    });
  });

  describe('generateEmbeddingsForAllFAQs', () => {
    it('should call embeddings endpoint', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      await faqApi.generateEmbeddingsForAllFAQs();
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);
      
      await expect(faqApi.getFAQs()).rejects.toThrow('Network Error');
    });
  });
}); 