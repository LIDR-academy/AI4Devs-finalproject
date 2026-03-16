import { jest } from '@jest/globals';

/**
 * Creates a mock for zod validation
 */
const mockZodValidation = jest.fn().mockImplementation(() => {
  const mockParse = jest.fn().mockImplementation((data: any) => {
    if (data.email === 'invalid-email' || (data.password && data.password.length < 8)) {
      const error = new Error('Validation failed');
      error.name = 'ZodError';
      // @ts-ignore - Mock error structure
      error.errors = [{ path: ['email'], message: 'Invalid email format' }];
      throw error;
    }
    return data;
  });

  return {
    object: jest.fn().mockReturnValue({ parse: mockParse }),
    string: jest.fn().mockReturnThis(),
    email: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
  };
});

export default mockZodValidation; 