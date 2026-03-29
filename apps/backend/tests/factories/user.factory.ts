export const createRegisterUserDto = (overrides = {}) => ({
  email: `test-${Date.now()}@example.com`,
  password: 'Password123!',
  fullName: 'Test User',
  ...overrides,
});

export const createLoginUserDto = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'Password123!',
  ...overrides,
});
