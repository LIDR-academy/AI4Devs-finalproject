import { Logger } from '@nestjs/common';
import { jest } from '@jest/globals';

// Disable logging during tests
Logger.overrideLogger(['error', 'warn']);

// Increase timeout for all tests
jest.setTimeout(30000); 