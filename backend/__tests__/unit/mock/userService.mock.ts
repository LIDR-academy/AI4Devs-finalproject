import { jest } from '@jest/globals';

const userServiceMock = {
  createUser: jest.fn(),
  login: jest.fn(),
  getUserById: jest.fn(),
};

export default userServiceMock; 