import { Product } from '../entities/Product';
import { ProductId } from '../valueObjects/ProductId';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductRepository {
  save(product: Product): Promise<Product>;
  findById(id: ProductId): Promise<Product | null>;
  findAll(filters?: ProductFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Product>>;
  update(product: Product): Promise<Product>;
  delete(id: ProductId): Promise<boolean>;
  getCategories(): Promise<string[]>;
} 