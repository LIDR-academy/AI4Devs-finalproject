import { NextFunction, Request, Response } from 'express';
import { authenticate } from '../../src/middlewares/auth.middleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  let originalConsoleError: typeof console.error;
  
  beforeAll(() => {
    // Save original console.error
    originalConsoleError = console.error;
    // Mock console.error to silence it during tests
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });
  
  it('should return 401 if no authorization header is present', () => {
    // Setup
    mockRequest.headers = {};
    
    // Execute
    authenticate(mockRequest as Request, mockResponse as Response, mockNext);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(mockNext).not.toHaveBeenCalled();
  });
  
  it('should return 401 if authorization format is invalid', () => {
    // Setup
    mockRequest.headers = { authorization: 'InvalidFormat' };
    
    // Execute
    authenticate(mockRequest as Request, mockResponse as Response, mockNext);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid authorization format' });
    expect(mockNext).not.toHaveBeenCalled();
  });
  
  it('should return 401 if token is invalid', () => {
    // Setup
    mockRequest.headers = { authorization: 'Bearer invalid-token' };
    
    // Execute
    authenticate(mockRequest as Request, mockResponse as Response, mockNext);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });
  
  it('should set req.user and call next() for valid token', () => {
    // Setup
    mockRequest.headers = { authorization: 'Bearer demo-token-123456' };
    
    // Execute
    authenticate(mockRequest as Request, mockResponse as Response, mockNext);
    
    // Assert
    expect(mockRequest.user).toEqual({
      userId: '1',
      email: 'test@example.com',
    });
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
  
  it('should handle unexpected errors during authentication', () => {
    // Setup 
    const error = new Error('Unexpected error');
    
    // Throw error when reading the authorization header
    mockRequest.headers = {};
    Object.defineProperty(mockRequest, 'headers', {
      get: () => {
        throw error;
      }
    });
    
    // Execute
    authenticate(mockRequest as Request, mockResponse as Response, mockNext);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unexpected error' });
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 