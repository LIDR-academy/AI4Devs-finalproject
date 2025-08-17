import { TestSetup } from './setup/test.setup';

let testSetup: TestSetup | null = null;

async function ensureTestSetup(): Promise<TestSetup> {
  if (!testSetup) {
    console.log('Initializing integration test environment...');
    testSetup = new TestSetup();
    await testSetup.initialize();
  }
  return testSetup;
}

// Jest global setup - this runs before all tests
export default async function globalSetup() {
  console.log('Jest global setup starting...');
  await ensureTestSetup();
  console.log('Jest global setup completed');
}

// Jest global teardown - this runs after all tests
export async function globalTeardown() {
  console.log('Cleaning up integration test environment...');
  if (testSetup) {
    await testSetup.close();
  }
}

// Export for use in tests - provides API access instead of direct database access
export const appSetup = {
  saveCategory: async (data: any) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().saveCategory(data);
  },
  saveTransaction: async (data: any) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().saveTransaction(data);
  },
  findCategory: async (id: string) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().findCategory(id);
  },
  findTransaction: async (id: string) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().findTransaction(id);
  },
  getAllCategories: async () => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().getAllCategories();
  },
  getAllTransactions: async (queryParams?: any) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().getAllTransactions(queryParams);
  },
  getTransactionSummary: async (startDate?: string, endDate?: string) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().getTransactionSummary(startDate, endDate);
  },
  deleteTransaction: async (id: string) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().deleteTransaction(id);
  },
  updateTransaction: async (id: string, data: any) => {
    const setup = await ensureTestSetup();
    return setup.getApiSetup().updateTransaction(id, data);
  },
  // Add missing methods for backward compatibility
  getDatabaseSetup: async () => {
    const setup = await ensureTestSetup();
    return setup.getDatabaseSetup();
  }
};
