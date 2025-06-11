import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginUser } from '../../../src/api/authApi';

describe('authApi', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('loginUser', () => {
    it('should make a POST request to the login endpoint with correct credentials', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          message: 'Login successful',
          token: 'test-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'ShopMefy2024' };
      await loginUser(credentials);

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    });

    it('should return the response data on successful login', async () => {
      const mockResponseData = {
        message: 'Login successful',
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await loginUser({ email: 'test@example.com', password: 'ShopMefy2024' });
      
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error when login fails', async () => {
      const errorMessage = 'Invalid email or password';
      
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ error: errorMessage }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        loginUser({ email: 'wrong@example.com', password: 'wrongpassword' })
      ).rejects.toThrow(errorMessage);
    });
  });
}); 