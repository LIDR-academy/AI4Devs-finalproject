import { ContainerSetup } from './container.setup';

export class TestSetup {
  private containerSetup: ContainerSetup;

  constructor() {
    this.containerSetup = new ContainerSetup();
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

}
