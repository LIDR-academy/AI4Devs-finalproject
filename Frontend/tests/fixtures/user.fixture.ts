/**
 * Reusable user data for frontend tests. No API calls.
 */

export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  nombre: 'Test User',
  email: 'test@travelsplit.test',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export function buildMockUser(overrides: Partial<typeof mockUser> = {}) {
  return { ...mockUser, ...overrides };
}
