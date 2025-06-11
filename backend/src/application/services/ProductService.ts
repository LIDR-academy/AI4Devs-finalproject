import { CreateProductDto, UpdateProductDto } from '../../domain';
import { Product } from '../../domain/entities/Product';
import { ProductCreatedEvent } from '../../domain/events/ProductEvents';
import {
    PaginatedResult,
    PaginationOptions,
    ProductFilters,
    ProductRepository
} from '../../domain/repositories/ProductRepository';
import { Price } from '../../domain/valueObjects/Price';
import { ProductId } from '../../domain/valueObjects/ProductId';
import { ProductName } from '../../domain/valueObjects/ProductName';
import { EventEmitter } from '../../infrastructure/events/EventEmitter';
import { PrismaProductRepository } from '../../infrastructure/repositories/PrismaProductRepository';

export class ProductService {
  private repository: ProductRepository;
  private eventEmitter: EventEmitter;

  constructor() {
    this.repository = new PrismaProductRepository();
    this.eventEmitter = EventEmitter.getInstance();
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    // Create domain entity with proper value objects
    const product = new Product(
      ProductId.generate(), // Generate a new UUID for the product
      new ProductName(productData.name),
      productData.description,
      new Price(productData.price),
      productData.category,
      productData.tags || [], // Aggiungo i tags con valore di default array vuoto
      productData.isActive !== undefined ? productData.isActive : true,
      new Date(),
      new Date()
    );

    // Use repository to save
    const savedProduct = await this.repository.save(product);
    
    // Emit domain event
    this.eventEmitter.emit(new ProductCreatedEvent(savedProduct));
    
    return savedProduct;
  }

  async getProducts(
    filters?: ProductFilters, 
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    return this.repository.findAll(filters, pagination);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.repository.findById(new ProductId(id));
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

  async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    // Get existing product
    const existingProduct = await this.getProductById(id);
    
    // Apply updates using domain methods
    if (productData.name) {
      existingProduct.updateName(new ProductName(productData.name));
    }
    
    if (productData.description) {
      existingProduct.updateDescription(productData.description);
    }
    
    if (productData.price !== undefined) {
      existingProduct.updatePrice(new Price(productData.price));
    }
    
    if (productData.category) {
      existingProduct.updateCategory(productData.category);
    }
    
    if (productData.tags) {
      existingProduct.updateTags(productData.tags);
    }
    
    if (productData.isActive !== undefined) {
      existingProduct.updateIsActive(productData.isActive);
    }
    
    // Use repository to update
    return this.repository.update(existingProduct);
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const productId = new ProductId(id);
    
    // First check if product exists
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Delete product
    await this.repository.delete(productId);
    
    return { success: true, message: 'Product deleted successfully' };
  }

  async getCategories(): Promise<string[]> {
    return this.repository.getCategories();
  }
} 