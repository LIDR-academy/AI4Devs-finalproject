import { vi } from 'vitest';

// Create axios mock
export const mockedAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

// Mock axios module
vi.mock('axios', () => ({
  default: mockedAxios
}));

// Helper to reset all mocks
export const resetAxiosMocks = () => {
  vi.clearAllMocks();
}; 