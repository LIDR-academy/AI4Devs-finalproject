import { Request, Response } from 'express';
import { z } from 'zod';
import productService from '../services/product.service';
import logger from '../utils/logger';

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  imageUrl: z.string().url('Invalid URL format').optional(),
  isActive: z.boolean().optional().default(true),
});

const updateProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative').optional(),
  category: z.string().min(2, 'Category must be at least 2 characters').optional(),
  imageUrl: z.string().url('Invalid URL format').optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const filtersSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
});

class ProductController {
  private productService: typeof productService;
  
  constructor() {
    this.productService = productService;
  }

  /**
   * Create a new product
   */
  async createProduct(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = createProductSchema.parse(req.body);
      
      // Create product using application service
      const product = await this.productService.createProduct(validatedData);
      
      return res.status(201).json({
        message: 'Product created successfully',
        product: product.toDTO(),
      });
    } catch (error) {
      logger.error('Create product error:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      // Handle service errors
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  /**
   * Get all products with optional filters
   */
  async getProducts(req: Request, res: Response) {
    try {
      // Validate and extract query parameters
      const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = filtersSchema.parse(req.query);
      
      // Get products with filters using application service
      const result = await this.productService.getProducts(
        { category, minPrice, maxPrice, search },
        { page, limit }
      );
      
      return res.status(200).json({
        data: result.data.map(p => p.toDTO()),
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Get products error:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      return res.status(500).json({ error: 'Failed to get products' });
    }
  }

  /**
   * Get a product by ID
   */
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const product = await this.productService.getProductById(id);
      
      return res.status(200).json(product.toDTO());
    } catch (error) {
      logger.error('Get product by ID error:', error);
      
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(500).json({ error: 'Failed to get product' });
    }
  }

  /**
   * Update a product
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validate request body
      const validatedData = updateProductSchema.parse(req.body);
      
      // Update product using application service
      const product = await this.productService.updateProduct(id, validatedData);
      
      return res.status(200).json({
        message: 'Product updated successfully',
        product: product.toDTO(),
      });
    } catch (error) {
      logger.error('Update product error:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      // Handle not found error
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Handle other errors
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await this.productService.deleteProduct(id);
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Delete product error:', error);
      
      // Handle not found error
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  /**
   * Get all product categories
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await this.productService.getCategories();
      
      return res.status(200).json(categories);
    } catch (error) {
      logger.error('Get categories error:', error);
      
      return res.status(500).json({ error: 'Failed to get categories' });
    }
  }
}

export default new ProductController(); 