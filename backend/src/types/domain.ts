export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ProductFilters {
  distance?: string[];
  surface?: string[];
  level?: string[];
  objective?: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  distance: string[];
  surface: string[];
  level: string[];
  objective: string[];
  sizes: string[];
  colors: string[];
  stock: number;
}
