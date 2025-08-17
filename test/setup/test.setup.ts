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
    await this.containerSetup.startContainers();
    
    await this.containerSetup.waitForService('db');
    await this.containerSetup.waitForService('backend');
    await this.containerSetup.waitForService('frontend');
  }

  async cleanup(): Promise<void> {
    // Basic cleanup can be done through backend API if needed
  }

  async close(): Promise<void> {
    // Don't stop containers - they're managed globally
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
