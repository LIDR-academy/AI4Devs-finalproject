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
const { chatApi } = await import('../../../src/api/chatApi');

describe('chatApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should call POST endpoint', async () => {
      mockedAxios.post.mockResolvedValue({ data: { response: 'Test response' } });
      
      await chatApi.sendMessage({ message: 'Test', userId: 'user-123' });
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should call POST endpoint with message data', async () => {
      const messageData = {
        message: 'What wines do you recommend?',
        sessionId: 'session-123',
        userId: 'user-456'
      };
      
      const mockResponse = { data: { response: 'I recommend Chianti.' } };
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      await chatApi.sendMessage(messageData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        messageData,
        expect.any(Object)
      );
    });

    it('should handle message without session ID', async () => {
      const messageData = {
        message: 'Tell me about red wines',
        userId: 'user-789'
      };
      
      const mockResponse = { data: { response: 'Red wines are...' } };
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      await chatApi.sendMessage(messageData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        messageData,
        expect.any(Object)
      );
    });

    it('should handle message with context parameters', async () => {
      const messageData = {
        message: 'What is the price of Barolo 2018?',
        sessionId: 'session-456',
        userId: 'user-123',
        context: {
          searchProducts: true,
          includeServices: false,
          maxResults: 5
        }
      };
      
      const mockResponse = { data: { response: 'Barolo 2018 is priced at €45.99' } };
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      await chatApi.sendMessage(messageData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        messageData,
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.post.mockRejectedValue(error);
      
      const messageData = { message: 'Test', userId: 'user-123' };
      
      await expect(chatApi.sendMessage(messageData)).rejects.toThrow('API Error');
    });
  });
}); 