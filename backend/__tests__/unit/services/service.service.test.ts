import serviceService from '../../../src/services/service.service';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockFindMany = jest.fn();
  const mockCount = jest.fn();
  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      service: {
        findMany: mockFindMany,
        count: mockCount,
        findUnique: mockFindUnique,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
      },
      $disconnect: jest.fn(),
    })),
    mockFindMany,
    mockCount,
    mockFindUnique,
    mockCreate,
    mockUpdate,
    mockDelete,
  };
});

const { mockFindMany, mockCount, mockFindUnique, mockCreate, mockUpdate, mockDelete } = jest.requireMock('@prisma/client');

describe('ServiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockService = {
    id: '1',
    name: 'Test Service',
    description: 'Test Description',
    price: 9.99,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    chunks: undefined as any, // Allow chunks to be undefined or an array
  };

  describe('getServices', () => {
    it('should get all services with pagination', async () => {
      // Arrange
      mockFindMany.mockResolvedValue([mockService]);
      mockCount.mockResolvedValue(1);

      // Act
      const result = await serviceService.getServices();

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { id: 'desc' },
      });
      
      expect(mockCount).toHaveBeenCalledWith({ where: {} });
      
      expect(result).toEqual({
        data: [mockService],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should apply filters correctly', async () => {
      // Arrange
      mockFindMany.mockResolvedValue([mockService]);
      mockCount.mockResolvedValue(1);
      const filters = {
        search: 'test',
      };

      // Act
      const result = await serviceService.getServices(filters);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test' } },
            { description: { contains: 'test' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { id: 'desc' },
      });
      expect(result.data).toHaveLength(1);
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      mockFindMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(serviceService.getServices()).rejects.toThrow('Failed to get services');
    });
  });

  describe('getAllServices', () => {
    it('should get all services', async () => {
      // Arrange
      mockFindMany.mockResolvedValue([mockService]);

      // Act
      const result = await serviceService.getAllServices();

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual([mockService]);
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      mockFindMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(serviceService.getAllServices()).rejects.toThrow('Failed to get services');
    });
  });

  describe('getServiceById', () => {
    it('should get a service by ID', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockService);

      // Act
      const result = await serviceService.getServiceById('1');

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockService);
    });

    it('should throw error when service not found', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(serviceService.getServiceById('1')).rejects.toThrow('Service not found');
    });
  });

  describe('createService', () => {
    it('should create a new service', async () => {
      // Arrange
      const newService = {
        name: 'New Service',
        description: 'New Description',
        price: 19.99,
      };
      
      const newServiceDb = {
        ...newService,
        id: '2',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockCreate.mockResolvedValue(newServiceDb);

      // Act
      const result = await serviceService.createService(newService);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: 'New Service',
          description: 'New Description',
          price: 19.99,
        },
      });
      expect(result).toEqual(newServiceDb);
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const newService = {
        name: 'New Service',
        description: 'New Description',
        price: 19.99,
      };
      mockCreate.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(serviceService.createService(newService)).rejects.toThrow('Failed to create service');
    });
  });

  describe('updateService', () => {
    it('should update an existing service', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Service',
        price: 29.99,
      };
      
      const updatedService = {
        ...mockService,
        ...updateData,
      };
      
      mockFindUnique.mockResolvedValue(mockService);
      mockUpdate.mockResolvedValue(updatedService);

      // Act
      const result = await serviceService.updateService('1', updateData);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(result).toEqual(updatedService);
    });

    it('should throw error when service not found', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(serviceService.updateService('1', { name: 'Updated' })).rejects.toThrow('Service not found');
    });
  });

  describe('deleteService', () => {
    it('should delete an existing service', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockService);
      mockDelete.mockResolvedValue(mockService);

      // Act
      const result = await serviceService.deleteService('1');

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({ success: true, message: 'Service deleted successfully' });
    });

    it('should throw error when service not found', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(serviceService.deleteService('1')).rejects.toThrow('Service not found');
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockService);
      mockDelete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(serviceService.deleteService('1')).rejects.toThrow('Database error');
    });
  });

  describe('ServiceChunk Integration', () => {
    it('should handle service with chunks relationship', async () => {
      // Arrange
      const serviceWithChunks = {
        ...mockService,
        chunks: [
          {
            id: 'chunk-1',
            content: 'Wine Tasting Experience - Professional wine tasting session',
            serviceId: '1',
            embedding: JSON.stringify([0.1, 0.2, 0.3]),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      } as any; // Use any type to avoid Prisma type conflicts
      
      mockFindUnique.mockResolvedValue(serviceWithChunks);

      // Act
      const result = await serviceService.getServiceById('1');

      // Assert
      expect(result).toEqual(serviceWithChunks);
      expect((result as any).chunks).toBeDefined();
      expect((result as any).chunks).toHaveLength(1);
    });

    it('should handle service without chunks', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(mockService);

      // Act
      const result = await serviceService.getServiceById('1');

      // Assert
      expect(result).toEqual(mockService);
      expect((result as any).chunks).toBeUndefined();
    });
  });
}); 