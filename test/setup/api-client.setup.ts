import { Configuration, TransactionsApi, CategoriesApi, AppApi } from 'ai4devs-api-client';

export interface TestApiClient {
  transactions: any;
  categories: any;
  app: any;
}

export const createTestApiClient = (baseUrl?: string): TestApiClient => {
  const config = new Configuration({ 
    basePath: baseUrl || 'http://backend:3000',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  return {
    transactions: new TransactionsApi(config),
    categories: new CategoriesApi(config),
    app: new AppApi(config)
  };
};

// Export the available types
export { Configuration, TransactionsApi, CategoriesApi, AppApi };
export * from 'ai4devs-api-client';
