import { Product } from '../types/domain';
import { IProductRepository } from '../repositories/product.repository';

export interface ICatalogService {
  getProducts(): Promise<{ products: Product[]; total: number }>;
  getProductById(id: string): Promise<Product | null>;
}

export class CatalogService implements ICatalogService {
  constructor(private productRepository: IProductRepository) {}

  async getProducts(): Promise<{ products: Product[]; total: number }> {
    const products = await this.productRepository.findAll();
    return { products, total: products.length };
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }
}
