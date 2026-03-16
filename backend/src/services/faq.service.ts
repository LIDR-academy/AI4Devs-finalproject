import { PrismaClient } from '@prisma/client';
import { CreateFAQDto, FAQFilters, UpdateFAQDto } from '../domain';
import logger from '../utils/logger';
import embeddingService from './embedding.service';

const prisma = new PrismaClient();

class FAQService {
  /**
   * Create a new FAQ
   */
  async createFAQ(faqData: CreateFAQDto) {
    try {
      const faq = await prisma.fAQ.create({
        data: faqData,
      });
      
      return faq;
    } catch (error) {
      logger.error('Error creating FAQ:', error);
      throw new Error('Failed to create FAQ');
    }
  }

  /**
   * Get all FAQs with optional filters
   */
  async getFAQs(filters?: FAQFilters, page = 1, limit = 10) {
    try {
      // Use embedding search if search term is provided
      if (filters?.search) {
        const searchTerm = filters.search;
        
        // Get FAQs using embedding search
        const faqs = await embeddingService.searchFAQs(searchTerm);
        
        // Apply pagination
        const paginatedFaqs = faqs.slice((page - 1) * limit, page * limit);
        
        return {
          data: paginatedFaqs,
          pagination: {
            page,
            limit,
            total: faqs.length,
            totalPages: Math.ceil(faqs.length / limit),
          },
        };
      }
      
      // Standard search without embedding
      const where: any = {};
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get FAQs with pagination
      const [faqs, total] = await Promise.all([
        prisma.fAQ.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: 'desc' },
        }),
        prisma.fAQ.count({ where }),
      ]);
      
      return {
        data: faqs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting FAQs:', error);
      throw new Error('Failed to get FAQs');
    }
  }

  /**
   * Get all FAQs
   */
  async getAllFAQs() {
    try {
      const faqs = await prisma.fAQ.findMany({
        orderBy: { id: 'desc' },
      });
      
      return faqs;
    } catch (error) {
      logger.error('Error getting all FAQs:', error);
      throw new Error('Failed to get FAQs');
    }
  }

  /**
   * Get all active FAQs
   */
  async getActiveFAQs() {
    try {
      const faqs = await prisma.fAQ.findMany({
        where: {
          isActive: true
        },
        orderBy: { id: 'desc' },
      });
      
      return faqs;
    } catch (error) {
      logger.error('Error getting active FAQs:', error);
      throw new Error('Failed to get active FAQs');
    }
  }

  /**
   * Get an FAQ by ID
   */
  async getFAQById(id: string) {
    try {
      const faq = await prisma.fAQ.findUnique({
        where: { id },
      });
      
      if (!faq) {
        throw new Error('FAQ not found');
      }
      
      return faq;
    } catch (error) {
      logger.error(`Error getting FAQ with ID ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get FAQ');
    }
  }

  /**
   * Update an FAQ
   */
  async updateFAQ(id: string, faqData: UpdateFAQDto) {
    try {
      // First check if the FAQ exists
      const existingFAQ = await prisma.fAQ.findUnique({
        where: { id },
      });
      
      if (!existingFAQ) {
        throw new Error('FAQ not found');
      }
      
      // Update the FAQ
      const updatedFAQ = await prisma.fAQ.update({
        where: { id },
        data: faqData,
      });
      
      return updatedFAQ;
    } catch (error) {
      logger.error(`Error updating FAQ with ID ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update FAQ');
    }
  }

  /**
   * Delete an FAQ
   */
  async deleteFAQ(id: string) {
    try {
      // Check if FAQ exists
      const existingFAQ = await prisma.fAQ.findUnique({
        where: { id },
      });

      if (!existingFAQ) {
        throw new Error('FAQ not found');
      }

      // Delete the FAQ (chunks will be deleted automatically due to cascade)
      await prisma.fAQ.delete({
        where: { id },
      });

      logger.info(`FAQ deleted successfully: ${id}`);
      return { success: true, message: 'FAQ deleted successfully' };
    } catch (error) {
      logger.error('Error deleting FAQ:', error);
      throw error;
    }
  }
}

export default new FAQService(); 