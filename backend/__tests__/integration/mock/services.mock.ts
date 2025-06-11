export const mockService = {
  id: 'test-service-id',
  name: 'Integration Test Service',
  description: 'Service created for integration testing',
  price: 29.99,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockServiceChunk = {
  id: 'test-chunk-id',
  content: 'Test service chunk content',
  serviceId: 'test-service-id',
  embedding: JSON.stringify([0.1, 0.2, 0.3]),
  createdAt: new Date(),
  updatedAt: new Date(),
  service: mockService
};

export const mockServiceUpdate = {
  name: 'Updated Integration Test Service',
  description: 'Updated service description for testing',
  price: 39.99,
  isActive: false
};

export const mockServiceCreate = {
  name: 'New Integration Test Service',
  description: 'New service created for integration testing',
  price: 19.99,
  isActive: true
}; 