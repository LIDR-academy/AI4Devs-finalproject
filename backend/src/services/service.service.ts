import { PrismaClient } from '@prisma/client';
import { CreateServiceDto, ServiceFilters, UpdateServiceDto } from '../domain';
import logger from '../utils/logger';

const prisma = new PrismaClient();

class ServiceService {
  /**
   * Create a new service
   */
  async createService(serviceData: CreateServiceDto) {
    try {
      const service = await prisma.service.create({
        data: serviceData,
      });
      
      return service;
    } catch (error) {
      logger.error('Error creating service:', error);
      throw new Error('Failed to create service');
    }
  }

  /**
   * Get all services with optional filters
   */
  async getServices(filters?: ServiceFilters, page = 1, limit = 10) {
    try {
      const where: any = {};
      
      // Apply search filter if provided
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } },
        ];
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get services with pagination
      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: 'desc' },
        }),
        prisma.service.count({ where }),
      ]);
      
      return {
        data: services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting services:', error);
      throw new Error('Failed to get services');
    }
  }

  /**
   * Get all services
   */
  async getAllServices() {
    try {
      const services = await prisma.service.findMany({
        orderBy: { id: 'desc' },
      });
      
      return services;
    } catch (error) {
      logger.error('Error getting all services:', error);
      throw new Error('Failed to get services');
    }
  }

  /**
   * Get all active services
   */
  async getActiveServices() {
    try {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { id: 'desc' },
      });
      
      return services;
    } catch (error) {
      logger.error('Error getting active services:', error);
      throw new Error('Failed to get active services');
    }
  }

  /**
   * Get a service by ID
   */
  async getServiceById(id: string) {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
      });
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      return service;
    } catch (error) {
      logger.error(`Error getting service with ID ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get service');
    }
  }

  /**
   * Update a service
   */
  async updateService(id: string, serviceData: UpdateServiceDto) {
    try {
      // First check if the service exists
      const existingService = await prisma.service.findUnique({
        where: { id },
      });
      
      if (!existingService) {
        throw new Error('Service not found');
      }
      
      // Update the service
      const updatedService = await prisma.service.update({
        where: { id },
        data: serviceData,
      });
      
      return updatedService;
    } catch (error) {
      logger.error(`Error updating service with ID ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update service');
    }
  }

  /**
   * Delete a service
   */
  async deleteService(id: string) {
    try {
      // First check if the service exists
      const existingService = await prisma.service.findUnique({
        where: { id },
      });
      
      if (!existingService) {
        throw new Error('Service not found');
      }
      
      // Delete the service
      await prisma.service.delete({
        where: { id },
      });
      
      return { success: true, message: 'Service deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting service with ID ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete service');
    }
  }
}

export default new ServiceService(); 