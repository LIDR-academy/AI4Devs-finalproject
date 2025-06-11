export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

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
  search?: string;
  isActive?: boolean;
} 