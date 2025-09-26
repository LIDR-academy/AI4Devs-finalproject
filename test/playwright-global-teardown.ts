import { testSetup } from './playwright-global-setup'

async function globalTeardown() {
  await testSetup.close()
}

export default globalTeardown;
