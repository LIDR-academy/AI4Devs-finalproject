import { PrismaClient } from '@prisma/client';
import { Product } from '../../domain/entities/Product';
import {
  PaginatedResult,
  PaginationOptions,
  ProductFilters,
  ProductRepository
} from '../../domain/repositories/ProductRepository';
import { ProductId } from '../../domain/valueObjects/ProductId';
import logger from '../../utils/logger';

export class PrismaProductRepository implements ProductRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async save(product: Product): Promise<Product> {
    try {
      const dto = product.toDTO();
      
      const savedProduct = await this.prisma.product.create({
        data: {
          id: dto.id,
          name: dto.name,
          description: dto.description,
          price: dto.price,
          category: dto.category,
          isActive: dto.isActive,
          tagsJson: JSON.stringify(dto.tags || []),
        },
      });
      
      // Add tags to the returned product
      const productWithTags = {
        ...savedProduct,
        tags: JSON.parse(savedProduct.tagsJson || '[]'),
      };
      
      return Product.fromDTO(productWithTags);
    } catch (error) {
      logger.error('Error saving product:', error);
      throw new Error('Failed to save product');
    }
  }

  async findById(id: ProductId): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: id.getValue() },
      });
      
      if (!product) {
        return null;
      }
      
      // Add tags to the product
      const productWithTags = {
        ...product,
        tags: JSON.parse(product.tagsJson || '[]'),
      };
      
      return Product.fromDTO(productWithTags);
    } catch (error) {
      logger.error(`Error finding product with ID ${id.getValue()}:`, error);
      throw new Error('Failed to find product');
    }
  }

  async findAll(
    filters?: ProductFilters, 
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedResult<Product>> {
    try {
      const where: any = {};
      
      // Apply category filter if provided
      if (filters?.category) {
        where.category = filters.category;
      }
      
      // Apply price range filters if provided
      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }
      
      // Apply search filter if provided
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } },
       
        ];
      }
      
      // Calculate pagination
      const skip = (pagination.page - 1) * pagination.limit;
      
      // Get products with pagination
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: pagination.limit,
          orderBy: { id: 'desc' },
        }),
        this.prisma.product.count({ where }),
      ]);
      
      // Add tags to each product
      const productsWithTags = products.map(product => ({
        ...product,
        tags: JSON.parse(product.tagsJson || '[]'),
      }));
      
      return {
        data: productsWithTags.map(p => Product.fromDTO(p)),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      };
    } catch (error) {
      logger.error('Error finding products:', error);
      throw new Error('Failed to find products');
    }
  }

  async update(product: Product): Promise<Product> {
    try {
      const dto = product.toDTO();
      
      const updatedProduct = await this.prisma.product.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          category: dto.category,
          isActive: dto.isActive,
          tagsJson: JSON.stringify(dto.tags || []),
        },
      });
      
      // Add tags to the returned product
      const productWithTags = {
        ...updatedProduct,
        tags: JSON.parse(updatedProduct.tagsJson || '[]'),
      };
      
      return Product.fromDTO(productWithTags);
    } catch (error) {
      logger.error(`Error updating product with ID ${product.id.getValue()}:`, error);
      throw new Error('Failed to update product');
    }
  }

  async delete(id: ProductId): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id: id.getValue() },
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting product with ID ${id.getValue()}:`, error);
      throw new Error('Failed to delete product');
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const products = await this.prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
      });
      
      return products.map(product => product.category);
    } catch (error) {
      logger.error('Error getting product categories:', error);
      throw new Error('Failed to get product categories');
    }
  }
} 