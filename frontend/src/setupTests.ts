// This file is run before each test file
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Import axios mock to ensure it's loaded for all tests
import '../__test__/unit/mocks/axios.mock';

// Extend vitest's expect with testing-library matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
}); 