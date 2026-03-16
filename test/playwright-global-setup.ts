import { TestSetup } from './setup/test.setup';

let testSetup: TestSetup;

async function globalSetup() {
  console.log('Initializing E2E test environment...');
  testSetup = new TestSetup();
  await testSetup.initialize();
}

export default globalSetup;

export { testSetup };
