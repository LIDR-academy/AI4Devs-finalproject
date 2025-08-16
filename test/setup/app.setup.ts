import { DatabaseSetup } from './database.setup';

export class AppSetup {
  private databaseSetup: DatabaseSetup;

  constructor() {
    this.databaseSetup = new DatabaseSetup();
  }

  async initialize(): Promise<void> {
    // Initialize database only
    await this.databaseSetup.initialize();
  }

  async cleanup(): Promise<void> {
    await this.databaseSetup.cleanup();
  }

  async close(): Promise<void> {
    await this.databaseSetup.close();
  }

  getDatabaseSetup(): DatabaseSetup {
    return this.databaseSetup;
  }
}
