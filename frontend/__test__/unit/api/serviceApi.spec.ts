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
const { serviceApi } = await import('../../../src/api/serviceApi');

describe('serviceApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getServices', () => {
    it('should call GET endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { data: [] } });
      
      await serviceApi.getServices();
      
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should call correct endpoint with search filter', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const filters = { search: 'consultation' };
      await serviceApi.getServices(filters, 3, 15);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/services'),
        expect.any(Object)
      );
    });

    it('should handle no filters', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      await serviceApi.getServices();
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/services'),
        expect.any(Object)
      );
    });
  });

  describe('createService', () => {
    it('should call POST endpoint', async () => {
      mockedAxios.post.mockResolvedValue({ data: { id: '1' } });
      
      await serviceApi.createService({ name: 'Test', description: 'Test', price: 10 });
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);
      
      await expect(serviceApi.getServices()).rejects.toThrow('API Error');
    });
  });
});