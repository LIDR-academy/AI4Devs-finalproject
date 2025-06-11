export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stock?: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stock?: number;
  isActive: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
} 