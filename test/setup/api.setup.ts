import { createTestApiClient, TestApiClient } from './api-client.setup';

export class ApiSetup {
  private api: TestApiClient;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    this.api = createTestApiClient(this.baseUrl);
  }

  // Category endpoints
  async saveCategory(categoryData: any): Promise<any> {
    const response = await this.api.categories.categoryControllerCreate({ createCategoryDto: categoryData });
    return response;
  }

  async findCategory(id: string): Promise<any> {
    const response = await this.api.categories.categoryControllerFindOne({ id });
    return response;
  }

  async updateCategory(id: string, categoryData: any): Promise<any> {
    const response = await this.api.categories.categoryControllerUpdate({ id, updateCategoryDto: categoryData });
    return response;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.categories.categoryControllerRemove({ id });
  }

  async getAllCategories(): Promise<any[]> {
    const response = await this.api.categories.categoryControllerFindAll();
    return response;
  }

  // Transaction endpoints
  async saveTransaction(transactionData: any): Promise<any> {
    const response = await this.api.transactions.transactionControllerCreate({ createTransactionDto: transactionData });
    return response;
  }

  async findTransaction(id: string): Promise<any> {
    const response = await this.api.transactions.transactionControllerFindOne({ id });
    return response;
  }

  async updateTransaction(id: string, transactionData: any): Promise<any> {
    const response = await this.api.transactions.transactionControllerUpdate({ id, updateTransactionDto: transactionData });
    return response;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.api.transactions.transactionControllerRemove({ id });
  }

  async getAllTransactions(queryParams?: any): Promise<any> {
    // Set a high limit to get all transactions by default
    const params = { ...queryParams, limit: 1000 };
    const response = await this.api.transactions.transactionControllerFindAll(params);
    // The backend returns a paginated response with { transactions: [], total: number, page: number, limit: number }
    // Extract just the transactions array for backward compatibility
    return response.transactions || response;
  }

  async getTransactionSummary(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.api.transactions.transactionControllerGetSummary(params);
    return response;
  }

  // Utility methods
  getBaseUrl(): string {
    return this.baseUrl;
  }

  getApiInstance(): TestApiClient {
    return this.api;
  }
}
