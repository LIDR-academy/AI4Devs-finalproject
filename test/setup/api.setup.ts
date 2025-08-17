import axios, { AxiosInstance } from 'axios';

export class ApiSetup {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  // Category endpoints
  async saveCategory(categoryData: any): Promise<any> {
    const response = await this.api.post('/api/categories', categoryData);
    return response.data;
  }

  async findCategory(id: string): Promise<any> {
    const response = await this.api.get(`/api/categories/${id}`);
    return response.data;
  }

  async updateCategory(id: string, categoryData: any): Promise<any> {
    const response = await this.api.patch(`/api/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/api/categories/${id}`);
  }

  async getAllCategories(): Promise<any[]> {
    const response = await this.api.get('/api/categories');
    return response.data;
  }

  // Transaction endpoints
  async saveTransaction(transactionData: any): Promise<any> {
    const response = await this.api.post('/api/transactions', transactionData);
    return response.data;
  }

  async findTransaction(id: string): Promise<any> {
    const response = await this.api.get(`/api/transactions/${id}`);
    return response.data;
  }

  async updateTransaction(id: string, transactionData: any): Promise<any> {
    const response = await this.api.patch(`/api/transactions/${id}`, transactionData);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.api.delete(`/api/transactions/${id}`);
  }

  async getAllTransactions(queryParams?: any): Promise<any> {
    // Set a high limit to get all transactions by default
    const params = { ...queryParams, limit: 1000 };
    const response = await this.api.get('/api/transactions', { params });
    // The backend returns a paginated response with { transactions: [], total: number, page: number, limit: number }
    // Extract just the transactions array for backward compatibility
    return response.data.transactions || response.data;
  }

  async getTransactionSummary(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.api.get('/api/transactions/summary', { params });
    return response.data;
  }

  // Utility methods
  getBaseUrl(): string {
    return this.baseUrl;
  }

  getApiInstance(): AxiosInstance {
    return this.api;
  }
}
