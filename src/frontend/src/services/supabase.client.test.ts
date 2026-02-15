/**
 * Tests for Supabase Client Singleton (T-031-FRONT)
 * 
 * Tests the singleton factory pattern with Dependency Injection support.
 * Phase: TDD-GREEN (implementation uses config injection for testability)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getSupabaseClient, resetSupabaseClient } from './supabase.client';

describe('Supabase Client Singleton', () => {
  beforeEach(() => {
    // Reset singleton instance before each test
    resetSupabaseClient();
  });

  describe('getSupabaseClient', () => {
    it('should throw error if VITE_SUPABASE_URL is missing', () => {
      // Given: Config with missing URL
      const invalidConfig = {
        url: '',
        anonKey: 'fake-anon-key',
      };

      // When/Then: Should throw descriptive error
      expect(() => {
        getSupabaseClient(invalidConfig);
      }).toThrow(/Missing Supabase environment variables/);
    });

    it('should throw error if VITE_SUPABASE_ANON_KEY is missing', () => {
      // Given: Config with missing anon key
      const invalidConfig = {
        url: 'https://fake-project.supabase.co',
        anonKey: '',
      };

      // When/Then: Should throw descriptive error
      expect(() => {
        getSupabaseClient(invalidConfig);
      }).toThrow(/Missing Supabase environment variables/);
    });

    it('should create a Supabase client instance with valid environment variables', () => {
      // Given: Valid configuration
      const validConfig = {
        url: 'https://test-project.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      };

      // When: Getting client
      const client = getSupabaseClient(validConfig);

      // Then: Should return a valid client object
      expect(client).toBeDefined();
      expect(client).toHaveProperty('channel');  // Supabase client has channel() method
      expect(client).toHaveProperty('auth');     // Supabase client has auth property
    });

    it('should return the same instance on multiple calls (singleton pattern)', () => {
      // Given: Valid configuration
      const validConfig = {
        url: 'https://test-project.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      };

      // When: Getting client twice
      const client1 = getSupabaseClient(validConfig);
      const client2 = getSupabaseClient(validConfig);

      // Then: Should return exact same instance
      expect(client1).toBe(client2);
    });
  });
});
