export interface ServiceResponse {
  total: number;
  services?: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    isActive: boolean;
    tags: string[];
  }>;
  error?: string;
}

export interface ProductResponse {
  total: number;
  products?: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    tags: string[];
  }>;
  error?: string;
  categories?: Array<{ name: string; count: number }>;
  alternativeSearch?: string;
}

export interface FAQResponse {
  total: number;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
  }>;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 