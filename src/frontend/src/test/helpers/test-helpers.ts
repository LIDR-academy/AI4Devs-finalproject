/**
 * T-1009-TEST-FRONT: Integration Test Helpers
 * 
 * Shared utilities for integration testing:
 * - Store setup/cleanup helpers
 * - DOM query wrappers
 * - Async utilities (retry, timeout)
 * - Keyboard interaction helpers
 * - Mock cleanup utilities
 * 
 * Pattern: Reusable test utilities to reduce boilerplate in integration tests
 */

import { waitFor } from '@testing-library/react';
import { usePartsStore } from '@/stores/parts.store';

/**
 * Setup store with initial parts data
 * 
 * Used in integration tests to pre-populate Zustand store before renderingcomponents.
 * 
 * Example:
 * ```typescript
 * setupStoreMock([mockPartCapitel, mockPartColumna]);
 * render(<Dashboard3D />);
 * ```
 */
export function setupStoreMock(parts: any[]) {
  usePartsStore.setState({ parts });
}

/**
 * Clear all parts from store
 * 
 * Use in afterEach to reset store state between tests.
 * 
 * Example:
 * ```typescript
 * afterEach(() => {
 *   clearStoreMock();
 * });
 * ```
 */
export function clearStoreMock() {
  usePartsStore.setState({ parts: [], selectedId: null });
}

/**
 * Wait for element with retry logic
 * 
 * Extends @testing-library/react's waitFor with custom retry strategy.
 * Useful for WebGL/Three.js rendering that may take multiple frames.
 * 
 * @param callback - Function that should eventually not throw
 * @param options - Timeout and interval options
 * 
 * Example:
 * ```typescript
 * await waitForWithRetry(
 *   () => expect(screen.getByTestId('model-loader')).toBeInTheDocument(),
 *   { timeout: 5000, interval: 100 }
 * );
 * ```
 */
export async function waitForWithRetry(
  callback: () => void,
  options?: { timeout?: number; interval?: number }
) {
  const { timeout = 3000, interval = 50 } = options || {};
  
  return waitFor(callback, { timeout, interval });
}

/**
 * Simulate keyboard event sequence
 * 
 * Shortcut for common keyboard interactions in modal tests.
 * 
 * @param keys - Array of key names (e.g., ['Tab', 'Enter', 'Escape'])
 * 
 * Example:
 * ```typescript
 * await simulateKeySequence(['Tab', 'Tab', 'Enter']); // Navigate and activate
 * ```
 */
export async function simulateKeySequence(keys: string[]) {
  for (const key of keys) {
    const event = new KeyboardEvent('keydown', {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
    
    // Wait a frame to allow React to process
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}

/**
 * Get focused element with fallback
 * 
 * Returns currently focused element or null if focus is on body/document.
 * Useful for focus trap assertions.
 * 
 * Example:
 * ```typescript
 * const focused = getFocusedElement();
 * expect(focused).toBe(closeButton);
 * ```
 */
export function getFocusedElement(): Element | null {
  const activeElement = document.activeElement;
  if (activeElement === document.body || !activeElement) {
    return null;
  }
  return activeElement;
}

/**
 * Assert focus trap is active
 * 
 * Verifies that Tab key cycles focus within a specific container.
 * 
 * @param container - Container element (e.g., modal dialog)
 * @param interactiveElements - Array of expected focusable elements
 * 
 * Example:
 * ```typescript
 * const modal = screen.getByRole('dialog');
 * const buttons = screen.getAllByRole('button');
 * assertFocusTrap(modal, buttons);
 * ```
 */
export function assertFocusTrap(
  container: Element,
  interactiveElements: Element[]
) {
  const focusedElement = getFocusedElement();
  
  if (!focusedElement) {
    throw new Error('No element is currently focused');
  }
  
  // Check if focused element is within container
  if (!container.contains(focusedElement)) {
    throw new Error('Focused element is outside container (focus trap not active)');
  }
  
  // Check if focused element is in the list of interactive elements
  if (!interactiveElements.some((el) => el === focusedElement)) {
    throw new Error('Focused element is not one of the expected interactive elements');
  }
}

/**
 * Wait for loading spinner to disappear
 * 
 * Common pattern: wait for "Cargando..." text to disappear before asserting content.
 * 
 * @param loadingText - Text to wait for disappearance (default: /cargando/i)
 * @param timeout - Max wait time in ms (default: 5000)
 * 
 * Example:
 * ```typescript
 * render(<PartDetailModal ... />);
 * await waitForLoadingToFinish();
 * expect(screen.getByText('SF-C12-CAP-001')).toBeInTheDocument();
 * ```
 */
export async function waitForLoadingToFinish(
  loadingText: RegExp = /cargando/i,
  timeout = 5000
) {
  await waitFor(
    () => {
      const loadingElements = document.body.textContent?.match(loadingText);
      if (loadingElements) {
        throw new Error('Still loading');
      }
    },
    { timeout }
  );
}

/**
 * Mock console methods for clean test output
 * 
 * Suppresses console.error and console.warn during tests to reduce noise.
 * Restores original methods after test.
 * 
 * Example:
 * ```typescript
 * beforeEach(() => {
 *   mockConsole();
 * });
 * 
 * afterEach(() => {
 *   restoreConsole();
 * });
 * ```
 */
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};

export function mockConsole() {
  console.error = vi.fn();
  console.warn = vi.fn();
}

export function restoreConsole() {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
}

/**
 * Create a promise that resolves after specified ms
 * 
 * Useful for simulating delays in tests (e.g., network latency).
 * 
 * Example:
 * ```typescript
 * vi.mocked(uploadService.getPartDetail).mockImplementation(async () => {
 *   await delay(500); // Simulate 500ms network delay
 *   return mockPartDetailCapitel;
 * });
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique test ID for dynamic content
 * 
 * Creates a UUID-like test identifier for parts created in tests.
 * 
 * Example:
 * ```typescript
 * const testPart = {
 *   id: generateTestId(),
 *   iso_code: 'SF-TEST-001',
 *   ...
 * };
 * ```
 */
let testIdCounter = 0;

export function generateTestId(prefix = 'test'): string {
  testIdCounter += 1;
  return `${prefix}-${Date.now()}-${testIdCounter}`;
}

/**
 * Reset test ID counter
 * 
 * Call in beforeEach to ensure consistent IDs across test runs.
 */
export function resetTestIdCounter() {
  testIdCounter = 0;
}

/**
 * Assert element is visible in viewport
 * 
 * Checks if element is not only in DOM, but also visible (not hidden by CSS).
 * 
 * Example:
 * ```typescript
 * const modal = screen.getByRole('dialog');
 * assertElementVisible(modal);
 * ```
 */
export function assertElementVisible(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  
  if (style.display === 'none') {
    throw new Error('Element has display: none');
  }
  
  if (style.visibility === 'hidden') {
    throw new Error('Element has visibility: hidden');
  }
  
  if (style.opacity === '0') {
    throw new Error('Element has opacity: 0');
  }
  
  // Check if element is in viewport (basic check)
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    throw new Error('Element has zero dimensions');
  }
}

/**
 * vi import for mock console functions
 * This is a re-export to avoid linter errors when using vi globally
 */
import { vi } from 'vitest';
