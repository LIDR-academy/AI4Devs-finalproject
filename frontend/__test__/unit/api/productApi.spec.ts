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
const { productApi } = await import('../../../src/api/productApi');

describe('productApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should call GET endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { data: [] } });
      
      await productApi.getProducts();
      
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  describe('createProduct', () => {
    it('should call POST endpoint', async () => {
      mockedAxios.post.mockResolvedValue({ data: { id: '1' } });
      
      await productApi.createProduct({ name: 'Test', description: 'Test', price: 10, category: 'test' });
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });
}); 