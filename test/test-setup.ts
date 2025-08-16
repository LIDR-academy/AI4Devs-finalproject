import { AppSetup } from './setup/app.setup';

let appSetup: AppSetup;

beforeAll(async () => {
  // Global test setup - ensure Docker containers are running
  console.log('Ensuring Docker test environment is ready...');
  
  // Initialize app setup for integration tests
  appSetup = new AppSetup();
  await appSetup.initialize();
});

afterAll(async () => {
  // Global test cleanup
  if (appSetup) {
    await appSetup.close();
  }
});

beforeEach(async () => {
  // Reset database state before each test
  if (appSetup) {
    await appSetup.cleanup();
  }
});

export { appSetup };
