import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import { SecurityService } from '../../../src/domain/services/SecurityService';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock logger
jest.mock('../../../src/utils/secureLogger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('SecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with proper salt rounds', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2b$12$hashedpassword';
      
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      const result = await SecurityService.hashPassword(password);
      
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should reject passwords shorter than minimum length', async () => {
      const shortPassword = 'short';
      
      await expect(SecurityService.hashPassword(shortPassword))
        .rejects.toThrow('Password must be at least 8 characters long');
      
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should reject empty password', async () => {
      await expect(SecurityService.hashPassword(''))
        .rejects.toThrow('Password must be at least 8 characters long');
      
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should reject null or undefined password', async () => {
      await expect(SecurityService.hashPassword(null as any))
        .rejects.toThrow('Password must be at least 8 characters long');
      
      await expect(SecurityService.hashPassword(undefined as any))
        .rejects.toThrow('Password must be at least 8 characters long');
      
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should handle bcrypt errors gracefully', async () => {
      const password = 'validPassword123';
      
      mockedBcrypt.hash.mockRejectedValue(new Error('Bcrypt error') as never);
      
      await expect(SecurityService.hashPassword(password))
        .rejects.toThrow('Password hashing failed');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = '$2b$12$hashedpassword';
      
      mockedBcrypt.compare.mockResolvedValue(true as never);
      
      const result = await SecurityService.verifyPassword(password, hash);
      
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'wrongPassword';
      const hash = '$2b$12$hashedpassword';
      
      mockedBcrypt.compare.mockResolvedValue(false as never);
      
      const result = await SecurityService.verifyPassword(password, hash);
      
      expect(result).toBe(false);
    });

    it('should handle bcrypt compare errors', async () => {
      const password = 'testPassword123';
      const hash = '$2b$12$hashedpassword';
      
      mockedBcrypt.compare.mockRejectedValue(new Error('Compare error') as never);
      
      await expect(SecurityService.verifyPassword(password, hash))
        .rejects.toThrow('Password verification failed');
    });
  });

  describe('isValidIP', () => {
    it('should validate IPv4 addresses', () => {
      expect(SecurityService.isValidIP('192.168.1.1')).toBe(true);
      expect(SecurityService.isValidIP('127.0.0.1')).toBe(true);
      expect(SecurityService.isValidIP('10.0.0.1')).toBe(true);
      expect(SecurityService.isValidIP('255.255.255.255')).toBe(true);
    });

    it('should validate IPv6 addresses', () => {
      expect(SecurityService.isValidIP('::1')).toBe(true);
      expect(SecurityService.isValidIP('2001:db8::1')).toBe(true);
      expect(SecurityService.isValidIP('fe80::1')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(SecurityService.isValidIP('256.256.256.256')).toBe(false);
      expect(SecurityService.isValidIP('192.168.1')).toBe(false);
      expect(SecurityService.isValidIP('not-an-ip')).toBe(false);
      expect(SecurityService.isValidIP('')).toBe(false);
      expect(SecurityService.isValidIP('192.168.1.1.1')).toBe(false);
    });
  });

  describe('isIPInRange', () => {
    it('should check if IP is in CIDR range', () => {
      expect(SecurityService.isIPInRange('192.168.1.100', '192.168.1.0/24')).toBe(true);
      expect(SecurityService.isIPInRange('192.168.1.1', '192.168.1.0/24')).toBe(true);
      expect(SecurityService.isIPInRange('192.168.2.1', '192.168.1.0/24')).toBe(false);
      expect(SecurityService.isIPInRange('10.0.0.1', '192.168.1.0/24')).toBe(false);
    });

    it('should handle invalid CIDR ranges', () => {
      expect(SecurityService.isIPInRange('192.168.1.1', 'invalid-range')).toBe(false);
      expect(SecurityService.isIPInRange('192.168.1.1', '192.168.1.0/33')).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Clear rate limit storage before each test
      (SecurityService as any).rateLimitStorage = new Map();
    });

    it('should allow requests within rate limit', () => {
      const identifier = 'test-user';
      const limit = 5;
      const windowMs = 60000;

      // First request should be allowed
      expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(true);
      
      // Subsequent requests within limit should be allowed
      for (let i = 1; i < limit; i++) {
        expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(true);
      }
    });

    it('should block requests exceeding rate limit', () => {
      const identifier = 'test-user';
      const limit = 3;
      const windowMs = 60000;

      // Use up the rate limit
      for (let i = 0; i < limit; i++) {
        expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(true);
      }

      // Next request should be blocked
      expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(false);
    });

    it('should reset rate limit after window expires', () => {
      const identifier = 'test-user';
      const limit = 2;
      const windowMs = 100; // Short window for testing

      // Use up the rate limit
      expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(true);
      expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(true);
      expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(false);

      // Wait for window to expire
      return new Promise(resolve => {
        setTimeout(() => {
          // Should be allowed again after window reset
          expect(SecurityService.checkRateLimit(identifier, limit, windowMs)).toBe(true);
          resolve(undefined);
        }, windowMs + 10);
      });
    });

    it('should handle different identifiers separately', () => {
      const limit = 2;
      const windowMs = 60000;

      // User 1 uses up their limit
      expect(SecurityService.checkRateLimit('user1', limit, windowMs)).toBe(true);
      expect(SecurityService.checkRateLimit('user1', limit, windowMs)).toBe(true);
      expect(SecurityService.checkRateLimit('user1', limit, windowMs)).toBe(false);

      // User 2 should still have their full limit
      expect(SecurityService.checkRateLimit('user2', limit, windowMs)).toBe(true);
      expect(SecurityService.checkRateLimit('user2', limit, windowMs)).toBe(true);
      expect(SecurityService.checkRateLimit('user2', limit, windowMs)).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token = SecurityService.generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate different tokens each time', () => {
      const token1 = SecurityService.generateSecureToken(16);
      const token2 = SecurityService.generateSecureToken(16);
      expect(token1).not.toBe(token2);
    });

    it('should handle different token lengths', () => {
      const shortToken = SecurityService.generateSecureToken(8);
      const longToken = SecurityService.generateSecureToken(64);
      
      expect(shortToken).toHaveLength(16); // 8 bytes = 16 hex characters
      expect(longToken).toHaveLength(128); // 64 bytes = 128 hex characters
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should handle SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    it('should preserve safe content', () => {
      const input = 'This is a safe string with numbers 123 and symbols !@#';
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).toContain('This is a safe string');
      expect(sanitized).toContain('123');
    });

    it('should handle empty and null inputs', () => {
      expect(SecurityService.sanitizeInput('')).toBe('');
      expect(SecurityService.sanitizeInput(null as any)).toBe('');
      expect(SecurityService.sanitizeInput(undefined as any)).toBe('');
    });
  });
}); 