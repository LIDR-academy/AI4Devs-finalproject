import { ContainerSetup } from './container.setup';
import { ApiSetup } from './api.setup';

export class TestSetup {
  private containerSetup: ContainerSetup;
  private apiSetup: ApiSetup;

  constructor() {
    this.containerSetup = new ContainerSetup();
    this.apiSetup = new ApiSetup();
  }

  async initialize(): Promise<void> {
    try {
      await this.containerSetup.up();
      
      console.log('All services are ready');
    } catch (error) {
      console.error('Failed to initialize test environment:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // Basic cleanup can be done through backend API if needed
  }

  async close(): Promise<void> {
    await this.containerSetup.down();
  }

  getApiSetup(): ApiSetup {
    return this.apiSetup;
  }

  getDatabaseSetup(): any {
    // Return a mock database setup that provides the methods tests expect
    return {
      saveCategory: (data: any) => this.apiSetup.saveCategory(data),
      saveTransaction: (data: any) => this.apiSetup.saveTransaction(data),
      findCategory: (id: string) => this.apiSetup.findCategory(id),
      findTransaction: (id: string) => this.apiSetup.findTransaction(id),
      deleteTransaction: (id: string) => this.apiSetup.deleteTransaction(id),
      getDataSource: () => ({
        createQueryBuilder: () => ({
          update: (table: string) => ({
            set: (data: any) => ({
              where: (condition: string, params: any) => ({
                execute: async () => {
                  // For now, just log that this was called
                  // In a real implementation, this would execute the query
                  console.log(`Mock database update: ${table}`, data, condition, params);
                }
              })
            })
          })
        })
      })
    };
  }
}
