/**
 * Tests for Notification Service (T-031-FRONT)
 * 
 * Tests the toast notification system for status change alerts.
 * Phase: TDD-GREEN (implementation uses standard imports)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { StatusTransition } from '../types/realtime';
import { showStatusNotification } from './notification.service';

describe('Notification Service', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Cleanup any remaining toasts
    document.body.innerHTML = '';
  });

  describe('showStatusNotification', () => {
    it('should display success toast for processing_to_validated transition', () => {
      // Given: A successful validation transition
      const transition: StatusTransition = 'processing_to_validated';
      const isoCode = 'SF-C12-M-001';

      // When: Showing notification
      showStatusNotification(transition, isoCode);

      // Then: Toast should be in DOM with correct content
      const toast = document.querySelector('[role="alert"]');
      expect(toast).toBeDefined();
      expect(toast?.textContent).toContain('Validation Complete');
      expect(toast?.textContent).toContain(isoCode);
    });

    it('should display error toast for processing_to_rejected transition', () => {
      // Given: A failed validation transition
      const transition: StatusTransition = 'processing_to_rejected';
      const isoCode = 'SF-C12-M-002';

      // When: Showing notification
      showStatusNotification(transition, isoCode);

      // Then: Toast should be in DOM with error styling
      const toast = document.querySelector('[role="alert"]');
      expect(toast).toBeDefined();
      expect(toast?.textContent).toContain('Validation Failed');
      expect(toast?.textContent).toContain(isoCode);
      // Check for red border styling (error type)
      expect(toast?.getAttribute('style')).toContain('#f44336');
    });

    it('should display warning toast for processing_to_error transition', () => {
      // Given: A processing error transition
      const transition: StatusTransition = 'processing_to_error';
      const isoCode = 'SF-C12-M-003';

      // When: Showing notification
      showStatusNotification(transition, isoCode);

      // Then: Toast should be in DOM with warning styling
      const toast = document.querySelector('[role="alert"]');
      expect(toast).toBeDefined();
      expect(toast?.textContent).toContain('Processing Error');
      expect(toast?.textContent).toContain(isoCode);
      // Check for orange border styling (warning type)
      expect(toast?.getAttribute('style')).toContain('#ff9800');
    });

    it('should have accessible ARIA attributes', () => {
      // Given: Any notification transition
      const transition: StatusTransition = 'processing_to_validated';
      const isoCode = 'SF-C12-M-004';

      // When: Showing notification
      showStatusNotification(transition, isoCode);

      // Then: Toast should have proper ARIA attributes
      const toast = document.querySelector('[role="alert"]');
      expect(toast).toBeDefined();
      expect(toast?.getAttribute('role')).toBe('alert');
      expect(toast?.getAttribute('aria-live')).toBe('polite');
    });

    it('should inject toast at bottom-right of viewport', () => {
      // Given: Any notification
      const transition: StatusTransition = 'processing_to_validated';
      const isoCode = 'SF-C12-M-005';

      // When: Showing notification
      showStatusNotification(transition, isoCode);

      // Then: Toast should be positioned at bottom-right
      const toast = document.querySelector('[role="alert"]') as HTMLElement;
      expect(toast).toBeDefined();
      const style = toast?.getAttribute('style') || '';
      expect(style).toContain('position: fixed');
      expect(style).toContain('bottom: 24px');
      expect(style).toContain('right: 24px');
    });

    it('should replace {iso_code} placeholder in message', () => {
      // Given: A notification with ISO code placeholder in message
      const transition: StatusTransition = 'processing_to_validated';
      const customIsoCode = 'CUSTOM-ISO-123';

      // When: Showing notification
      showStatusNotification(transition, customIsoCode);

      // Then: Message should contain the actual ISO code
      const toast = document.querySelector('[role="alert"]');
      expect(toast?.textContent).toContain(customIsoCode);
      expect(toast?.textContent).not.toContain('{iso_code}');
    });
  });

  describe('NOTIFICATION_CONFIG constants', () => {
    it('should export notification configuration for all transitions', () => {
      // When: Using showStatusNotification with all transitions
      // Then: All three transitions should work without throwing
      expect(() => {
        showStatusNotification('processing_to_validated', 'TEST-001');
        showStatusNotification('processing_to_rejected', 'TEST-002');
        showStatusNotification('processing_to_error', 'TEST-003');
      }).not.toThrow();
      
      // And: Should create 3 toasts
      const toasts = document.querySelectorAll('[role="alert"]');
      expect(toasts.length).toBe(3);
    });
  });

  describe('Toast auto-removal', () => {
    it('should auto-remove toast after 5 seconds', async () => {
      // Given: Fake timers
      vi.useFakeTimers();
      
      // When: Showing notification
      showStatusNotification('processing_to_validated', 'SF-C12-M-006');
      
      // Then: Toast should be present initially
      expect(document.querySelector('[role="alert"]')).toBeDefined();
      
      // When: 5 seconds pass
      vi.advanceTimersByTime(5300); // 5s + 300ms for slideOut animation
      
      // Then: Toast should be removed
      expect(document.querySelector('[role="alert"]')).toBeNull();
      
      vi.useRealTimers();
    });
  });
});
