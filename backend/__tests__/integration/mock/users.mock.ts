/**
 * Mock users for integration tests
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  password: 'hashed-password',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: '$2b$10$iHb5iNkMOm/0ruKp7uXRUuI4wYPzIz28Oe033XZsspEBbiKBDWYnu', // ShopMefy2024
    firstName: 'Test',
    lastName: 'User',
  },
  mockUser
];

export const mockUserUpdate = {
  firstName: 'Updated Test',
  lastName: 'Updated User',
  isActive: false
};

export const mockUserCreate = {
  email: 'newuser@example.com',
  password: 'new-hashed-password',
  firstName: 'New',
  lastName: 'User',
  isActive: true
};

export default mockUsers; 