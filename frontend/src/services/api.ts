import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async verifyToken() {
    const response = await this.api.post('/auth/verify');
    return response.data;
  }

  // Property endpoints
  async getProperties(filters: any = {}) {
    const response = await this.api.get('/properties', { params: filters });
    return response.data;
  }

  async getPropertyById(id: number) {
    const response = await this.api.get(`/properties/${id}`);
    return response.data;
  }

  async createProperty(propertyData: any) {
    const response = await this.api.post('/properties', propertyData);
    return response.data;
  }

  async updateProperty(id: number, propertyData: any) {
    const response = await this.api.put(`/properties/${id}`, propertyData);
    return response.data;
  }

  async deleteProperty(id: number) {
    const response = await this.api.delete(`/properties/${id}`);
    return response.data;
  }

  async getUserProperties() {
    const response = await this.api.get('/properties/user');
    return response.data;
  }

  async toggleFeatured(id: number) {
    const response = await this.api.patch(`/properties/${id}/featured`);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export default new ApiService();
