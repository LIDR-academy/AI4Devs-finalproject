/**
 * T-1009-TEST-FRONT: MSW (Mock Service Worker) Configuration
 * 
 * Configures HTTP request mocking for integration tests using msw library.
 * Mocks backend API endpoints:
 * - GET /api/parts/{id} → Return PartDetail
 * - GET /api/parts/{id}/navigation → Return AdjacentPartsInfo
 * 
 * Pattern: MSW handlers + server setup for Vitest environment
 * 
 * Usage:
 * ```typescript
 * import { server } from './setupMockServer';
 * 
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 * 
 * NOTE: This file is NOT USED in current test implementation (services mocked via vi.mock instead).
 * Included for future migration to MSW pattern if needed.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Fixtures
import {
  mockPartDetailCapitel,
  mockPartDetailColumna,
  mockPartDetailProcessing,
  mockPartDetailInvalidated,
  mockPartDetailGLBError,
  mockAdjacentPartsDefault,
  mockAdjacentPartsFirst,
  mockAdjacentPartsLast,
  mockAdjacentPartsSingle,
} from '../fixtures/viewer.fixtures';

import type { PartDetail } from '@/types/parts';
import type { AdjacentPartsInfo } from '@/types/modal';

/**
 * Base API URL (configurable via environment variable)
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * In-memory mock database for parts
 * Maps part ID to PartDetail object
 */
const mockPartsDatabase: Record<string, PartDetail> = {
  [mockPartDetailCapitel.id]: mockPartDetailCapitel,
  [mockPartDetailColumna.id]: mockPartDetailColumna,
  [mockPartDetailProcessing.id]: mockPartDetailProcessing,
  [mockPartDetailInvalidated.id]: mockPartDetailInvalidated,
  [mockPartDetailGLBError.id]: mockPartDetailGLBError,
};

/**
 * In-memory mock database for navigation
 * Maps part ID to AdjacentPartsInfo
 */
const mockNavigationDatabase: Record<string, AdjacentPartsInfo> = {
  [mockPartDetailCapitel.id]: mockAdjacentPartsDefault,
  [mockPartDetailColumna.id]: mockAdjacentPartsDefault,
  [mockPartDetailProcessing.id]: mockAdjacentPartsFirst,
  [mockPartDetailInvalidated.id]: mockAdjacentPartsLast,
  [mockPartDetailGLBError.id]: mockAdjacentPartsSingle,
};

/**
 * MSW HTTP Handlers
 * Define mock responses for backend API endpoints
 */
export const handlers = [
  /**
   * GET /api/parts/:id
   * 
   * Returns PartDetail for a given part_id.
   * 
   * Success (200): Returns PartDetail JSON
   * Not Found (404): Part ID not in mock database
   * Server Error (500): Simulated error for testing
   */
  http.get(`${API_BASE_URL}/parts/:id`, ({ params }) => {
    const { id } = params;

    // Edge case: Simulate 404 for unknown part
    if (!mockPartsDatabase[id as string]) {
      return HttpResponse.json(
        { detail: 'Part not found' },
        { status: 404 }
      );
    }

    // Edge case: Simulate 500 server error for specific test case
    if (id === 'error-500-test') {
      return HttpResponse.json(
        { detail: 'Internal server error' },
        { status: 500 }
      );
    }

    // Success: Return part detail
    const partDetail = mockPartsDatabase[id as string];
    return HttpResponse.json(partDetail, { status: 200 });
  }),

  /**
   * GET /api/parts/:id/navigation
   * 
   * Returns navigation info (previous_id, next_id, position) for a given part_id.
   * 
   * Success (200): Returns AdjacentPartsInfo JSON
   * Not Found (404): Part ID not in mock database
   */
  http.get(`${API_BASE_URL}/parts/:id/navigation`, ({ params }) => {
    const { id } = params;

    // Edge case: Simulate 404 for unknown part
    if (!mockNavigationDatabase[id as string]) {
      return HttpResponse.json(
        { detail: 'Part not found' },
        { status: 404 }
      );
    }

    // Success: Return navigation info
    const navigationInfo = mockNavigationDatabase[id as string];
    return HttpResponse.json(navigationInfo, { status: 200 });
  }),
];

/**
 * MSW Server Instance
 * 
 * Created with handlers and configured for Node.js environment (Vitest).
 * 
 * Usage in tests:
 * ```typescript
 * import { server } from './test/integration/helpers/setupMockServer';
 * 
 * beforeAll(() => {
 *   server.listen({ onUnhandledRequest: 'error' }); // Fail on unmocked requests
 * });
 * 
 * afterEach(() => {
 *   server.resetHandlers(); // Reset any runtime request handlers
 * });
 * 
 * afterAll(() => {
 *   server.close(); // Cleanup
 * });
 * ```
 */
export const server = setupServer(...handlers);

/**
 * Helper: Override specific handler at runtime
 * 
 * Useful for testing error scenarios in a single test without affecting others.
 * 
 * Example:
 * ```typescript
 * it('should handle 500 error', async () => {
 *   overrideHandler('GET', '/api/parts/:id', () => {
 *     return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
 *   });
 *   // Test logic here
 * });
 * ```
 */
export function overrideHandler(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  resolver: Parameters<typeof http.get>[1]
) {
  const httpMethod = http[method.toLowerCase() as keyof typeof http];
  server.use(httpMethod(`${API_BASE_URL}${path}`, resolver as any));
}

/**
 * Helper: Add custom part to mock database at runtime
 * 
 * Example:
 * ```typescript
 * const customPart: PartDetail = { id: 'custom-id', ... };
 * addMockPart(customPart);
 * 
 * const customNav: AdjacentPartsInfo = { previous_id: null, ... };
 * addMockNavigation('custom-id', customNav);
 * ```
 */
export function addMockPart(part: PartDetail, navigation?: AdjacentPartsInfo) {
  mockPartsDatabase[part.id] = part;
  if (navigation) {
    mockNavigationDatabase[part.id] = navigation;
  }
}

/**
 * Helper: Clear all mock parts (reset to initial state)
 */
export function clearMockDatabase() {
  Object.keys(mockPartsDatabase).forEach((key) => {
    if (
      ![
        mockPartDetailCapitel.id,
        mockPartDetailColumna.id,
        mockPartDetailProcessing.id,
        mockPartDetailInvalidated.id,
        mockPartDetailGLBError.id,
      ].includes(key)
    ) {
      delete mockPartsDatabase[key];
    }
  });

  Object.keys(mockNavigationDatabase).forEach((key) => {
    if (
      ![
        mockPartDetailCapitel.id,
        mockPartDetailColumna.id,
        mockPartDetailProcessing.id,
        mockPartDetailInvalidated.id,
        mockPartDetailGLBError.id,
      ].includes(key)
    ) {
      delete mockNavigationDatabase[key];
    }
  });
}
