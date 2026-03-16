import axios from 'axios';
import { CreateServiceDto, Service, ServiceFilters, UpdateServiceDto } from '../types/dto/service.dto';

const API_URL = import.meta.env.VITE_API_URL || '';
const SERVICES_ENDPOINT = API_URL ? `${API_URL}/api/services` : '/api/services';

// Get authentication token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const serviceApi = {
  // Get all services with optional filters
  async getServices(
    filters?: ServiceFilters,
    page = 1,
    limit = 10
  ) {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.append('search', filters.search);
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const response = await axios.get(`${SERVICES_ENDPOINT}?${queryParams.toString()}`, getAuthHeader());
    return response.data;
  },
  
  // Get all services
  async getAllServices() {
    const response = await axios.get(`${SERVICES_ENDPOINT}`);
    return response.data as Service[];
  },
  
  // Get a service by ID
  async getServiceById(id: string) {
    const response = await axios.get(`${SERVICES_ENDPOINT}/${id}`, getAuthHeader());
    return response.data as Service;
  },
  
  // Create a new service
  async createService(service: CreateServiceDto) {
    const response = await axios.post(SERVICES_ENDPOINT, service, getAuthHeader());
    return response.data;
  },
  
  // Update an existing service
  async updateService(id: string, service: UpdateServiceDto) {
    const response = await axios.put(`${SERVICES_ENDPOINT}/${id}`, service, getAuthHeader());
    return response.data;
  },
  
  // Delete a service
  async deleteService(id: string) {
    const response = await axios.delete(`${SERVICES_ENDPOINT}/${id}`, getAuthHeader());
    return response.data;
  },

  // Generate embeddings for all active services using ServiceChunk
  async generateEmbeddingsForAllServices() {
    const response = await axios.post('/api/embeddings/services/generate-all', {}, getAuthHeader());
    return response.data;
  },
}; 