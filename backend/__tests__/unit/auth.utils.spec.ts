import bcrypt from 'bcrypt';
import { comparePasswords, hashPassword } from '../../src/utils/auth';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('Auth Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      // Setup
      const mockSalt = 'mock-salt';
      const mockHash = 'hashed-password';
      const password = 'ShopMefy2024';
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
      
      // Execute
      const result = await hashPassword(password);
      
      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(mockHash);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      // Setup
      const plainPassword = 'ShopMefy2024';
      const hashedPassword = 'hashed-password';
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      // Execute
      const result = await comparePasswords(plainPassword, hashedPassword);
      
      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      // Setup
      const plainPassword = 'ShopMefy2024';
      const hashedPassword = 'hashed-password';
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      // Execute
      const result = await comparePasswords(plainPassword, hashedPassword);
      
      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
}); 