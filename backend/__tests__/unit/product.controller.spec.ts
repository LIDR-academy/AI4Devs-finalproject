import { Request, Response } from 'express';
import productController from '../../src/controllers/product.controller';
import productService from '../../src/services/product.service';

// Mock the product service
jest.mock('../../src/services/product.service');

describe('Product Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  
  beforeEach(() => {
    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockImplementation(() => ({ json: responseJson }));
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
    
    jest.clearAllMocks();
  });
  
  describe('createProduct', () => {
    const validProductData = {
      name: 'Test Product',
      description: 'This is a test product with a longer description',
      price: 99.99,
      imageUrl: 'https://example.com/image.jpg',
      category: 'Test Category',
    };
    
    it('should create a product successfully', async () => {
      mockRequest.body = validProductData;
      
      const mockProduct = { 
        id: '123', 
        ...validProductData, 
        createdAt: new Date(), 
        updatedAt: new Date(),
        toDTO: jest.fn().mockReturnValue({ id: '123', ...validProductData })
      };
      
      (productService.createProduct as jest.Mock).mockResolvedValue(mockProduct);
      
      await productController.createProduct(mockRequest as Request, mockResponse as Response);
      
      expect(productService.createProduct).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'This is a test product with a longer description',
        price: 99.99,
        imageUrl: 'https://example.com/image.jpg',
        category: 'Test Category',
        isActive: true
      });
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Product created successfully',
        product: expect.anything(),
      });
    });
    
    it('should return 400 for validation errors', async () => {
      mockRequest.body = {
        name: 'T', // Too short
        price: -10, // Negative price
      };
      
      await productController.createProduct(mockRequest as Request, mockResponse as Response);
      
      expect(productService.createProduct).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
          details: expect.any(Array),
        })
      );
    });
    
    it('should handle service errors', async () => {
      mockRequest.body = validProductData;
      
      const error = new Error('Product ID cannot be empty');
      (productService.createProduct as jest.Mock).mockRejectedValue(error);
      
      await productController.createProduct(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Product ID cannot be empty' });
    });
  });
  
  describe('getProducts', () => {
    it('should get products with default pagination', async () => {
      const mockProductsResult = {
        data: [{ 
          id: '123', 
          name: 'Test Product',
          toDTO: jest.fn().mockReturnValue({ id: '123', name: 'Test Product' })
        }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      
      (productService.getProducts as jest.Mock).mockResolvedValue(mockProductsResult);
      
      await productController.getProducts(mockRequest as Request, mockResponse as Response);
      
      expect(productService.getProducts).toHaveBeenCalledWith(
        { category: undefined, minPrice: undefined, maxPrice: undefined, search: undefined },
        { page: 1, limit: 10 }
      );
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        data: expect.anything(),
        pagination: mockProductsResult.pagination
      });
    });
    
    it('should apply filters from query', async () => {
      mockRequest.query = {
        category: 'Electronics',
        minPrice: '50',
        maxPrice: '200',
        search: 'test',
        page: '2',
        limit: '20',
      };
      
      const mockProductsResult = {
        data: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
      
      (productService.getProducts as jest.Mock).mockResolvedValue(mockProductsResult);
      
      await productController.getProducts(mockRequest as Request, mockResponse as Response);
      
      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Electronics',
          minPrice: 50,
          maxPrice: 200,
          search: 'test',
        }),
        expect.any(Object)
      );
    });
    
    it('should handle service errors', async () => {
      (productService.getProducts as jest.Mock).mockRejectedValue(new Error('Service error'));
      
      await productController.getProducts(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Failed to get products' });
    });
  });
  
  describe('getProductById', () => {
    it('should return a product when found', async () => {
      mockRequest.params = { id: '123' };
      
      const mockProduct = { 
        id: '123', 
        name: 'Test Product',
        toDTO: jest.fn().mockReturnValue({ id: '123', name: 'Test Product' })
      };
      (productService.getProductById as jest.Mock).mockResolvedValue(mockProduct);
      
      await productController.getProductById(mockRequest as Request, mockResponse as Response);
      
      expect(productService.getProductById).toHaveBeenCalledWith('123');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(expect.anything());
    });
    
    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: '999' };
      
      const error = new Error('Product not found');
      (productService.getProductById as jest.Mock).mockRejectedValue(error);
      
      await productController.getProductById(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });
  
  describe('updateProduct', () => {
    const updateData = {
      name: 'Updated Product',
      price: 129.99,
    };
    
    it('should update a product successfully', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = updateData;
      
      const mockProduct = { 
        id: '123', 
        ...updateData,
        toDTO: jest.fn().mockReturnValue({ id: '123', ...updateData })
      };
      (productService.updateProduct as jest.Mock).mockResolvedValue(mockProduct);
      
      await productController.updateProduct(mockRequest as Request, mockResponse as Response);
      
      expect(productService.updateProduct).toHaveBeenCalledWith('123', updateData);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Product updated successfully',
        product: expect.anything(),
      });
    });
    
    it('should return 400 for validation errors', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = {
        price: -10, // Negative price
      };
      
      await productController.updateProduct(mockRequest as Request, mockResponse as Response);
      
      expect(productService.updateProduct).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
    });
    
    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = updateData;
      
      const error = new Error('Product not found');
      (productService.updateProduct as jest.Mock).mockRejectedValue(error);
      
      await productController.updateProduct(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });
  
  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      mockRequest.params = { id: '123' };
      
      const mockResult = { success: true, message: 'Product deleted successfully' };
      (productService.deleteProduct as jest.Mock).mockResolvedValue(mockResult);
      
      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);
      
      expect(productService.deleteProduct).toHaveBeenCalledWith('123');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockResult);
    });
    
    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: '999' };
      
      const error = new Error('Product not found');
      (productService.deleteProduct as jest.Mock).mockRejectedValue(error);
      
      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });
  
  describe('getCategories', () => {
    it('should return product categories', async () => {
      const mockCategories = ['Electronics', 'Books', 'Clothing'];
      (productService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
      
      await productController.getCategories(mockRequest as Request, mockResponse as Response);
      
      expect(productService.getCategories).toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockCategories);
    });
  });
}); 