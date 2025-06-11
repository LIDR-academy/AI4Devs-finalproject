import { expect, jest } from '@jest/globals';
import { Request, Response } from 'express';
import authController from '../../src/controllers/auth.controller';
import userService from '../../src/services/user.service';

// Mock user service
jest.mock('../../src/services/user.service', () => ({
  createUser: jest.fn(),
  login: jest.fn(),
  getUserById: jest.fn(),
}));

// Mock auth utils
jest.mock('../../src/utils/auth', () => ({
  checkTestPassword: jest.fn(),
}));

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });
  
  describe('login', () => {
    it('should handle test account login successfully', async () => {
      // Setup
      mockRequest.body = {
        email: 'test@example.com',
        password: 'ShopMefy2024',
      };
      
      // Execute
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should handle invalid credentials', async () => {
      // Setup
      mockRequest.body = {
        email: 'another@example.com',
        password: 'wrong-password',
      };
      
      (userService.login as jest.Mock).mockRejectedValue(new Error('Invalid email or password'));
      
      // Execute
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
}); 