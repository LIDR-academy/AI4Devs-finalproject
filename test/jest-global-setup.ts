import { TestSetup } from './setup/test.setup';

let testSetup: TestSetup | null = null;

async function ensureTestSetup(): Promise<void> {
  if (!testSetup) {
    console.log('Initializing integration test environment...');
    testSetup = new TestSetup();
    await testSetup.initialize();
  }
}

// Jest global setup - this runs before all tests
export default async function globalSetup() {
  console.log('Jest global setup starting...');
  try {
    await ensureTestSetup();
    console.log('Jest global setup completed');
  } catch (error) {
    console.error('Jest global setup failed:', error);
    // Don't throw here - let Jest handle the failure gracefully
    process.exit(1);
  }
}

// Jest global teardown - this runs after all tests
export async function globalTeardown() {
  console.log('Cleaning up integration test environment...');
  if (testSetup) {
    await testSetup.close();
  }
}
