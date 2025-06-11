export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  countOnly?: boolean;
  isActive?: boolean;
} 