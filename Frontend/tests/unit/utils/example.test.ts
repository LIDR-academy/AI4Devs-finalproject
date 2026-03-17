/**
 * Example unit test. Replace with real utils/component tests.
 */
import { describe, it, expect } from 'vitest';
import { buildMockUser } from '../../fixtures/user.fixture';

describe('utils example', () => {
  it('should build mock user with overrides', () => {
    const user = buildMockUser({ nombre: 'Custom' });
    expect(user.nombre).toBe('Custom');
    expect(user.email).toBeDefined();
  });
});
