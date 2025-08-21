import { ContainerSetup } from './container.setup';
import { Client } from 'pg';

export class TestSetup {
  private containerSetup: ContainerSetup;

  constructor() {
    this.containerSetup = new ContainerSetup();
  }

  async initialize(): Promise<void> {
    try {
      await this.containerSetup.up();
      
      console.log('All services are ready');
      
      // Seed test database with minimal data
      await this.seedTestDatabase();
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

  private async seedTestDatabase(): Promise<void> {
    try {
      console.log('Seeding test database...');
      
      // Connect to test database
      const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3433'),
        database: process.env.DB_NAME || 'salary_tracker',
        user: process.env.DB_USER || 'user',
        password: process.env.DB_PASSWORD || 'password',
      });

      await client.connect();
      console.log('Connected to test database');

      // Check if categories already exist
      const categoryResult = await client.query('SELECT COUNT(*) FROM categories');
      const categoryCount = parseInt(categoryResult.rows[0].count);

      if (categoryCount === 0) {
        console.log('Creating test categories...');
        
        // Create test categories using the same names as the original seed data
        await client.query(`
          INSERT INTO categories (id, name, flow, color, description, "createdAt", "updatedAt")
          VALUES 
            (gen_random_uuid(), 'Salary', 'income', '#10B981', 'Regular employment income', NOW(), NOW()),
            (gen_random_uuid(), 'Freelance', 'income', '#3B82F6', 'Freelance and contract work', NOW(), NOW()),
            (gen_random_uuid(), 'Investments', 'income', '#8B5CF6', 'Investment returns and dividends', NOW(), NOW()),
            (gen_random_uuid(), 'Groceries', 'expense', '#EF4444', 'Food and household items', NOW(), NOW()),
            (gen_random_uuid(), 'Utilities', 'expense', '#F59E0B', 'Electricity, water, gas, internet', NOW(), NOW()),
            (gen_random_uuid(), 'Transportation', 'expense', '#06B6D4', 'Fuel, public transport, maintenance', NOW(), NOW()),
            (gen_random_uuid(), 'Entertainment', 'expense', '#EC4899', 'Movies, dining out, hobbies', NOW(), NOW()),
            (gen_random_uuid(), 'Healthcare', 'expense', '#84CC16', 'Medical expenses and insurance', NOW(), NOW()),
            (gen_random_uuid(), 'Savings', 's&i', '#6366F1', 'Regular savings contributions', NOW(), NOW()),
            (gen_random_uuid(), 'Emergency Fund', 's&i', '#059669', 'Emergency savings fund', NOW(), NOW()),
            (gen_random_uuid(), 'Retirement', 's&i', '#DC2626', 'Retirement account contributions', NOW(), NOW())
        `);
        
        console.log('Test categories created successfully');
      } else {
        console.log(`Found ${categoryCount} existing categories, skipping creation`);
      }

      await client.end();
      console.log('Test database seeding completed');
      
    } catch (error) {
      console.log('Could not seed test database:', error);
      // Don't fail the test setup, just log the error
    }
  }
}
