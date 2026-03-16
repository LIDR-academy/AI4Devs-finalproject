export interface CreateServiceDto {
  name: string;
  description: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface ServiceFilters {
  isActive?: boolean;
  search?: string;
} 