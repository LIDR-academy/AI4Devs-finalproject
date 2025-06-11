import axios from 'axios';
import { CreateProductDto, Product, UpdateProductDto } from '../types/product';

const API_URL = import.meta.env.VITE_API_URL || '';
const PRODUCTS_ENDPOINT = API_URL ? `${API_URL}/api/products` : '/api/products';

// Get authentication token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const productApi = {
  // Get all products with optional filters
  async getProducts(
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    },
    page = 1,
    limit = 10
  ) {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) queryParams.append('search', filters.search);
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const response = await axios.get(`${PRODUCTS_ENDPOINT}?${queryParams.toString()}`, getAuthHeader());
    return response.data;
  },
  
  // Get a product by ID
  async getProductById(id: string) {
    const response = await axios.get(`${PRODUCTS_ENDPOINT}/${id}`, getAuthHeader());
    return response.data as Product;
  },
  
  // Create a new product
  async createProduct(product: CreateProductDto) {
    const response = await axios.post(PRODUCTS_ENDPOINT, product, getAuthHeader());
    return response.data;
  },
  
  // Update an existing product
  async updateProduct(id: string, product: UpdateProductDto) {
    const response = await axios.put(`${PRODUCTS_ENDPOINT}/${id}`, product, getAuthHeader());
    return response.data;
  },
  
  // Delete a product
  async deleteProduct(id: string) {
    const response = await axios.delete(`${PRODUCTS_ENDPOINT}/${id}`, getAuthHeader());
    return response.data;
  },
  
  // Get all product categories
  async getCategories() {
    const response = await axios.get(`${PRODUCTS_ENDPOINT}/categories`, getAuthHeader());
    return response.data as string[];
  },
}; 